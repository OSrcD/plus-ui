<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="评论编号" prop="commentId">
              <el-input v-model="queryParams.commentId" placeholder="请输入评论编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="自媒体账号编号" prop="mediaAccountId">
              <el-input v-model="queryParams.mediaAccountId" placeholder="请输入自媒体账号编号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="小红书笔记信息" prop="xhsNoteInfo">
              <el-input v-model="queryParams.xhsNoteInfo" placeholder="请输入小红书笔记信息" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="检查状态" prop="checkStatus">
              <el-select v-model="queryParams.checkStatus" placeholder="请选择检查状态" clearable>
                <el-option label="未检查" :value="0" />
                <el-option label="已检查" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="评论状态" prop="commentStatus">
              <el-select v-model="queryParams.commentStatus" placeholder="请选择评论状态" clearable>
                <el-option label="正常" :value="0" />
                <el-option label="吞评" :value="1" />
              </el-select>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['business:promptCommentComplete:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['business:promptCommentComplete:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['business:promptCommentComplete:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['business:promptCommentComplete:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="promptCommentCompleteList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="已评论编号" align="center" prop="commentCompleteId" v-if="true" />
        <el-table-column label="评论编号" align="center" prop="commentId" />
        <el-table-column label="自媒体账号编号" align="center" prop="mediaAccountId" />
        <el-table-column label="小红书笔记信息" align="center" prop="xhsNoteInfo" show-overflow-tooltip />
        <el-table-column label="检查状态" align="center" prop="checkStatus">
          <template #default="scope">
            <el-tag v-if="scope.row.checkStatus === 0" type="info">未检查</el-tag>
            <el-tag v-else-if="scope.row.checkStatus === 1" type="success">已检查</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评论状态" align="center" prop="commentStatus">
          <template #default="scope">
            <el-tag v-if="scope.row.commentStatus === 0" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.commentStatus === 1" type="danger">吞评</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:promptCommentComplete:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:promptCommentComplete:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改已评论对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="promptCommentCompleteFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="评论编号" prop="commentId">
          <el-input v-model="form.commentId" placeholder="请输入评论编号" />
        </el-form-item>
        <el-form-item label="自媒体账号编号" prop="mediaAccountId">
          <el-input v-model="form.mediaAccountId" placeholder="请输入自媒体账号编号" />
        </el-form-item>
        <el-form-item label="小红书笔记信息" prop="xhsNoteInfo">
          <el-input v-model="form.xhsNoteInfo" type="textarea" placeholder="请输入小红书笔记信息" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="检查状态" prop="checkStatus">
          <el-radio-group v-model="form.checkStatus">
            <el-radio :label="0">未检查</el-radio>
            <el-radio :label="1">已检查</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="评论状态" prop="commentStatus">
          <el-radio-group v-model="form.commentStatus">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">吞评</el-radio>
          </el-radio-group>
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

<script setup name="PromptCommentComplete" lang="ts">
import { listPromptCommentComplete, getPromptCommentComplete, delPromptCommentComplete, addPromptCommentComplete, updatePromptCommentComplete } from '@/api/business/promptCommentComplete';
import { PromptCommentCompleteVO, PromptCommentCompleteQuery, PromptCommentCompleteForm } from '@/api/business/promptCommentComplete/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const promptCommentCompleteList = ref<PromptCommentCompleteVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const promptCommentCompleteFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PromptCommentCompleteForm = {
  commentCompleteId: undefined,
  commentId: undefined,
  mediaAccountId: undefined,
  remark: undefined,
  xhsNoteInfo: undefined,
  checkStatus: 0,
  commentStatus: undefined,
}
const data = reactive<PageData<PromptCommentCompleteForm, PromptCommentCompleteQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    commentId: undefined,
    mediaAccountId: undefined,
    xhsNoteInfo: undefined,
    checkStatus: undefined,
    commentStatus: undefined,
    params: {
    }
  },
  rules: {
    commentCompleteId: [
      { required: true, message: "已评论编号不能为空", trigger: "blur" }
    ],
    commentId: [
      { required: true, message: "评论编号不能为空", trigger: "blur" }
    ],
    mediaAccountId: [
      { required: true, message: "自媒体账号编号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询已评论列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPromptCommentComplete(queryParams.value);
  promptCommentCompleteList.value = res.rows;
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
  promptCommentCompleteFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PromptCommentCompleteVO[]) => {
  ids.value = selection.map(item => item.commentCompleteId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加已评论";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PromptCommentCompleteVO) => {
  reset();
  const _commentCompleteId = row?.commentCompleteId || ids.value[0]
  const res = await getPromptCommentComplete(_commentCompleteId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改已评论";
}

/** 提交按钮 */
const submitForm = () => {
  promptCommentCompleteFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.commentCompleteId) {
        await updatePromptCommentComplete(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPromptCommentComplete(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PromptCommentCompleteVO) => {
  const _commentCompleteIds = row?.commentCompleteId || ids.value;
  await proxy?.$modal.confirm('是否确认删除已评论编号为"' + _commentCompleteIds + '"的数据项？').finally(() => loading.value = false);
  await delPromptCommentComplete(_commentCompleteIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('business/promptCommentComplete/export', {
    ...queryParams.value
  }, `promptCommentComplete_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
