<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="提示词模板ID" prop="promptId">
              <el-input v-model="queryParams.promptId" placeholder="请输入提示词模板ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="标题" prop="title">
              <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="提示词评论内容" prop="commentContent">
              <el-input v-model="queryParams.commentContent" placeholder="请输入提示词评论内容" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['business:promptComment:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['business:promptComment:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['business:promptComment:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['business:promptComment:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="promptCommentList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="提示词评论ID" align="center" prop="commentId" v-if="true" />
        <el-table-column label="提示词模板ID" align="center" prop="promptId" />
        <el-table-column label="标题" align="center" prop="title" />
        <el-table-column label="提示词评论内容" align="center" prop="commentContent" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:promptComment:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:promptComment:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改提示词评论对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="promptCommentFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="提示词模板ID" prop="promptId">
          <el-input v-model="form.promptId" placeholder="请输入提示词模板ID" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="提示词评论内容" prop="commentContent">
          <el-input v-model="form.commentContent" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PromptComment" lang="ts">
import { listPromptComment, getPromptComment, delPromptComment, addPromptComment, updatePromptComment } from '@/api/business/promptComment';
import { PromptCommentVO, PromptCommentQuery, PromptCommentForm } from '@/api/business/promptComment/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const promptCommentList = ref<PromptCommentVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const promptCommentFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PromptCommentForm = {
  commentId: undefined,
  promptId: undefined,
  title: undefined,
  commentContent: undefined,
  remark: undefined,
}
const data = reactive<PageData<PromptCommentForm, PromptCommentQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    promptId: undefined,
    title: undefined,
    commentContent: undefined,
    params: {
    }
  },
  rules: {
    commentId: [
      { required: true, message: "提示词评论ID不能为空", trigger: "blur" }
    ],
    promptId: [
      { required: true, message: "提示词模板ID不能为空", trigger: "blur" }
    ],
    commentContent: [
      { required: true, message: "提示词评论内容不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询提示词评论列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPromptComment(queryParams.value);
  promptCommentList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  promptCommentFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: PromptCommentVO[]) => {
  ids.value = selection.map(item => item.commentId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加提示词评论";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PromptCommentVO) => {
  reset();
  const _commentId = row?.commentId || ids.value[0]
  const res = await getPromptComment(_commentId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改提示词评论";
}

/** 提交按钮 */
const submitForm = () => {
  promptCommentFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.commentId) {
        await updatePromptComment(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPromptComment(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PromptCommentVO) => {
  const _commentIds = row?.commentId || ids.value;
  await proxy?.$modal.confirm('是否确认删除提示词评论编号为"' + _commentIds + '"的数据项？').finally(() => loading.value = false);
  await delPromptComment(_commentIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('business/promptComment/export', {
    ...queryParams.value
  }, `promptComment_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
