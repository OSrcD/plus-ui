<template>
  <div class="app-container material-library">
    <el-card class="glass-panel main-card">
      <template #header>
        <div class="header-content">
          <div class="title-group">
            <el-icon class="logo-icon"><Picture /></el-icon>
            <div class="text">
              <h2>高级素材库 (Asset Hub)</h2>
              <p>管理您的 AI 绘图灵感素材。支持批量上传与一键引用到复刻流程。</p>
            </div>
          </div>
          <div class="action-group">
            <el-button type="primary" icon="Upload" @click="handleAdd">上传新素材</el-button>
            <el-button icon="Refresh" @click="getList">刷新</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="material-grid">
        <div v-for="item in materialList" :key="item.materialId" class="material-item">
          <div class="material-card">
            <div class="image-wrapper" @click="handlePreview(item)">
              <el-image :src="item.materialUrl" fit="cover" class="material-image" />
              <div class="hover-overlay">
                <el-button type="danger" icon="Delete" circle @click.stop="handleDelete(item)" />
              </div>
            </div>
            <div class="material-info">
              <div class="name line-clamp-1" :title="item.materialName">{{ item.materialName || '未命名素材' }}</div>
              <div class="time">{{ item.createTime }}</div>
            </div>
          </div>
        </div>
        <el-empty v-if="!loading && materialList.length === 0" description="素材库空空如也，快去上传吧" />
      </div>

      <div class="pagination-container">
        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialog.visible" :title="uploadDialog.title" width="500px" append-to-body>
      <el-form ref="materialFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="素材名称" prop="materialName">
          <el-input v-model="form.materialName" placeholder="建议输入便于辨识的名称" />
        </el-form-item>
        <el-form-item label="素材文件" prop="materialUrl">
          <image-upload v-model="tempOssId" :limit="1" @update:modelValue="handleUploadChange" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialog.visible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-image-viewer 
      v-if="pv.visible" 
      :url-list="pv.list" 
      @close="pv.visible = false"
    />
  </div>
</template>

<script setup name="MaterialLibrary">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue';
import { listMaterial, addMaterial, delMaterial } from '@/api/business/material';
import { listByIds } from '@/api/system/oss';
import { Picture, Delete, Upload, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance();

const loading = ref(false);
const submitLoading = ref(false);
const total = ref(0);
const materialList = ref([]);
const tempOssId = ref('');

const queryParams = reactive({
  pageNum: 1,
  pageSize: 12,
  materialName: undefined,
  fileType: '0'
});

const uploadDialog = reactive({
  visible: false,
  title: '新增素材'
});

const form = ref({
  materialName: '',
  materialUrl: '',
  fileType: '0',
  remark: ''
});

const rules = {
  materialName: [{ required: true, message: '素材名称不能为空', trigger: 'blur' }],
  materialUrl: [{ required: true, message: '素材文件不能为空', trigger: 'change' }]
};

const pv = reactive({
  visible: false,
  list: []
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await listMaterial(queryParams);
    materialList.value = res.rows;
    total.value = res.total;
  } catch (e) {
    ElMessage.error('获取列表失败');
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  form.value = {
    materialName: '',
    materialUrl: '',
    fileType: '0',
    remark: ''
  };
  tempOssId.value = '';
  uploadDialog.visible = true;
};

const handleUploadChange = async (ossId) => {
  if (!ossId) {
    form.value.materialUrl = '';
    return;
  }
  // 获取刚刚上传图片的URL
  try {
    const res = await listByIds(ossId);
    if (res.data && res.data.length > 0) {
      form.value.materialUrl = res.data[0].url;
      if (!form.value.materialName) {
        form.value.materialName = res.data[0].fileName;
      }
    }
  } catch (e) {
    ElMessage.error('获取上传素材信息失败');
  }
};

const submitForm = async () => {
  proxy.$refs.materialFormRef.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        await addMaterial(form.value);
        ElMessage.success('上传素材成功');
        uploadDialog.visible = false;
        getList();
      } catch (e) {
        ElMessage.error('保存失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const handleDelete = (item) => {
  ElMessageBox.confirm(`确定删除素材 "${item.materialName || '未命名'}" 吗？`).then(async () => {
    try {
      await delMaterial(item.materialId);
      ElMessage.success('删除成功');
      getList();
    } catch (e) {
      ElMessage.error('删除失败');
    }
  });
};

const handlePreview = (item) => {
  pv.list = [item.materialUrl];
  pv.visible = true;
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.app-container { background-color: #f8fafc; min-height: calc(100vh - 84px); padding: 20px; }
.main-card { border-radius: 16px; border: none; box-shadow: 0 4px 25px rgba(0,0,0,0.05); }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.title-group { display: flex; align-items: center; gap: 15px; }
.logo-icon { font-size: 32px; color: #3b82f6; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 14px; }
.text h2 { margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; }
.text p { margin: 4px 0 0; font-size: 13px; color: #64748b; }

.material-grid { 
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
  padding: 20px 0;
}

.material-item { perspective: 1000px; }
.material-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
}
.material-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Square aspect ratio */
  cursor: pointer;
  background: #f1f5f9;
}
.material-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
}
.material-card:hover .material-image { transform: scale(1.05); }

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  backdrop-filter: blur(2px);
}
.image-wrapper:hover .hover-overlay { opacity: 1; }

.material-info { padding: 12px; }
.name { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px; }
.time { font-size: 11px; color: #94a3b8; }

.pagination-container { margin-top: 30px; display: flex; justify-content: center; }

.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

@media (max-width: 768px) {
  .material-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
}
</style>
