<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="提示词模板" prop="template">
              <el-input v-model="queryParams.template" placeholder="请输入提示词模板" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="提示词分类" prop="templateType">
              <el-select v-model="queryParams.templateType" placeholder="请选择提示词分类" clearable >
                <el-option v-for="dict in biz_prompt_template_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable >
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['business:promptTemplate:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['business:promptTemplate:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['business:promptTemplate:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['business:promptTemplate:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="promptTemplateList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="提示词ID" align="center" prop="promptId" v-if="true" />
        <el-table-column label="提示词模板" align="center" prop="template" />
        <el-table-column label="提示词分类" align="center" prop="templateType">
          <template #default="scope">
            <dict-tag :options="biz_prompt_template_type" :value="scope.row.templateType"/>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:promptTemplate:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:promptTemplate:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改提示词模板对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="promptTemplateFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="提示词模板" prop="template">
          <el-input v-model="form.template" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="提示词分类" prop="templateType">
          <el-select v-model="form.templateType" placeholder="请选择提示词分类">
            <el-option
              v-for="dict in biz_prompt_template_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
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

<script setup name="PromptTemplate" lang="ts">
import { listPromptTemplate, getPromptTemplate, delPromptTemplate, addPromptTemplate, updatePromptTemplate } from '@/api/business/promptTemplate';
import { PromptTemplateVO, PromptTemplateQuery, PromptTemplateForm } from '@/api/business/promptTemplate/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { biz_prompt_template_type, sys_normal_disable } = toRefs<any>(proxy?.useDict('biz_prompt_template_type', 'sys_normal_disable'));

const promptTemplateList = ref<PromptTemplateVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const promptTemplateFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PromptTemplateForm = {
  promptId: undefined,
  template: undefined,
  templateType: undefined,
  status: undefined,
  remark: undefined,
}
const data = reactive<PageData<PromptTemplateForm, PromptTemplateQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    template: undefined,
    templateType: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    promptId: [
      { required: true, message: "提示词ID不能为空", trigger: "blur" }
    ],
    template: [
      { required: true, message: "提示词模板不能为空", trigger: "blur" }
    ],
    templateType: [
      { required: true, message: "提示词分类不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询提示词模板列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPromptTemplate(queryParams.value);
  promptTemplateList.value = res.rows;
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
  promptTemplateFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PromptTemplateVO[]) => {
  ids.value = selection.map(item => item.promptId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加提示词模板";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PromptTemplateVO) => {
  reset();
  const _promptId = row?.promptId || ids.value[0]
  const res = await getPromptTemplate(_promptId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改提示词模板";
}

/** 提交按钮 */
const submitForm = () => {
  promptTemplateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.promptId) {
        await updatePromptTemplate(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPromptTemplate(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PromptTemplateVO) => {
  const _promptIds = row?.promptId || ids.value;
  await proxy?.$modal.confirm('是否确认删除提示词模板编号为"' + _promptIds + '"的数据项？').finally(() => loading.value = false);
  await delPromptTemplate(_promptIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('business/promptTemplate/export', {
    ...queryParams.value
  }, `promptTemplate_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
