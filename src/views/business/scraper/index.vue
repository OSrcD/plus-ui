<template>
  <div class="app-container power-grid-container">
    <el-card class="glass-panel main-card">
      <template #header>
        <div class="header-content">
          <div class="title-group">
            <el-icon class="logo-icon"><Film /></el-icon>
            <div class="text">
              <h2>全员复刻工作台 (Pro Studio)</h2>
              <p>文案、多图、视频全链条复刻。一个原贴，针对运营人员的资产管理大板。</p>
            </div>
          </div>
          <div class="filter-group">
            <el-input v-model="queryParams.keyword" placeholder="搜原素材..." clearable @keyup.enter="handleQuery" style="width: 200px; margin-right: 10px;" />
            <el-button type="primary" icon="Refresh" @click="handleQuery">刷新大板</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <div v-for="post in postList" :key="post.scraperId" class="post-group">
          
          <!-- 1. 原素材参照行 (灰色背景) -->
          <div class="table-row original-row">
            <div class="cell-version-label">
              <span class="ref-tag">原贴参考</span>
              <el-button type="success" size="small" icon="CirclePlus" @click="createNewVersion(post)">建新版</el-button>
              <el-button type="warning" size="small" icon="MagicStick" :loading="restyleStatus[post.scraperId]?.loading" @click="handleAutoRestyle(post)">一键AI复刻</el-button>
              <div v-if="restyleStatus[post.scraperId]?.msg" class="status-msg">{{ restyleStatus[post.scraperId].msg }}</div>
            </div>
            <div class="cell-text">
              <div class="original-title line-clamp-1" :title="post.title">{{ post.title || '无标题' }}</div>
              <div class="original-body line-clamp-2" :title="post.content">{{ post.content || '无正文' }}</div>
              <div class="cell-actions">
                <el-button size="small" type="primary" plain @click="copy(post.title + '\n' + post.content)">复制文案</el-button>
                <el-button size="small" link @click="openLink(post.sourceUrl)">去原文看</el-button>
              </div>
            </div>
            
            <div class="media-column-wrapper">
                <!-- 原素材图片 -->
                <div v-for="(img, idx) in getOriginalImgList(post)" :key="idx" class="media-cell img-cell original-img-cell">
                  <div class="media-preview" @click="handlePreviewImg(img, getOriginalImgList(post))">
                    <el-image :src="img" fit="cover" class="img-thumb" />
                  </div>
                  <div class="media-actions">
                    <el-button size="small" type="success" icon="Download" circle title="下载原图" @click.stop="handleDownload(img, `original_${post.postId}_${idx+1}.png`)"></el-button>
                    <el-button size="small" type="danger" icon="Delete" circle title="移除原图" @click.stop="removeOriginalImage(post, idx)"></el-button>
                  </div>
                  <div class="img-label">原图 {{ idx+1 }}</div>
                </div>
                <!-- 原素材视频封面 -->
                <div v-if="getOriginalVideos(post).length > 0" class="media-cell video-cell">
                  <div class="video-placeholder" @click="playOriginalVideo(post)">
                    <el-icon><VideoPlay /></el-icon><span>原视频</span>
                  </div>
                </div>
            </div>
          </div>

          <!-- 2. 复刻版本行 (每一个 Version 是一整包) -->
          <div v-for="(ver, vidx) in getVersions(post)" :key="vidx" class="table-row version-row">
            <div class="cell-version-label">
              <span class="ver-badge">Ver.{{ vidx+1 }}</span>
              <el-tag :type="ver.isUsed ? 'success' : 'info'" size="small">{{ ver.isUsed ? '已发' : '未使用' }}</el-tag>
              <el-button link type="danger" icon="Delete" @click="removeVersion(post, vidx)"></el-button>
            </div>
            
            <div class="cell-text">
              <div class="ver-title-row" @click="editVerProp(post, vidx, 'title')">
                <span class="v-title line-clamp-1">{{ ver.title }}</span>
                <div class="text-row-actions">
                  <el-button size="small" icon="MagicStick" circle type="primary" plain title="AI重写文案(全文)" @click.stop="handleIndividualRestyle(post, 'text', vidx)"></el-button>
                  <el-button size="small" icon="CopyDocument" circle @click.stop="copy(ver.title)"></el-button>
                </div>
              </div>
              <div class="ver-content-row" @click="editVerProp(post, vidx, 'content')">
                 <span class="v-body line-clamp-2">{{ ver.content }}</span>
                 <el-button size="small" icon="CopyDocument" circle @click.stop="copy(ver.content)"></el-button>
              </div>
            </div>

            <div class="media-column-wrapper">
              <!-- 复刻图片列 -->
              <div v-for="(_, iidx) in getOriginalImgList(post)" :key="iidx" class="media-cell img-cell">
                <div v-if="!ver.images || !ver.images[iidx] || !ver.images[iidx].url" class="empty-restyle-container">
                  <div class="media-preview empty-box" @click="editImageRestyle(post, vidx, iidx)">
                    <el-icon><Picture /></el-icon><span>未复刻</span>
                  </div>
                  <div class="media-actions">
                    <el-button type="primary" size="small" icon="MagicStick" circle title="独立AI复刻" @click.stop="handleIndividualRestyle(post, 'image', vidx, iidx)"></el-button>
                    <el-button type="warning" size="small" icon="Edit" circle title="手动登记地址" @click.stop="editImageRestyle(post, vidx, iidx)"></el-button>
                  </div>
                </div>
                <div v-else class="restyle-img-container">
                  <div class="media-preview" @click="handlePreviewImg(ver.images[iidx].url, ver.images.map(i => i.url))">
                    <el-image :src="ver.images[iidx].url" fit="cover" class="img-thumb ver-border" />
                  </div>
                  <div class="media-actions">
                    <el-button size="small" type="primary" plain icon="MagicStick" circle title="重新复刻" @click.stop="handleIndividualRestyle(post, 'image', vidx, iidx)"></el-button>
                    <el-button size="small" type="warning" plain icon="Edit" circle title="手动登记" @click.stop="editImageRestyle(post, vidx, iidx)"></el-button>
                    <el-button size="small" type="success" plain icon="Download" circle title="下载此图" @click.stop.prevent="handleDownload(ver.images[iidx].url, `img_${post.postId}_${iidx+1}.png`)"></el-button>
                    <el-button size="small" type="info" plain icon="CopyDocument" circle title="复制链接" @click.stop="copy(ver.images[iidx].url)"></el-button>
                  </div>
                </div>
                <div class="img-label">对应原图 {{ iidx+1 }}</div>
              </div>

              <!-- 复刻视频成果 -->
              <div class="media-cell video-cell restyle-video">
                <div v-if="!ver.videoUrl" class="empty-video-container">
                  <div class="media-preview empty-box" @click="editVersionVideo(post, vidx)">
                    <el-icon><Film /></el-icon><span>上传视频</span>
                  </div>
                  <div class="media-actions">
                    <el-button type="primary" size="small" icon="MagicStick" circle title="独立AI复刻视频" @click.stop="handleIndividualRestyle(post, 'video', vidx)"></el-button>
                    <el-button type="warning" size="small" icon="Edit" circle title="手动登记地址" @click.stop="editVersionVideo(post, vidx)"></el-button>
                  </div>
                </div>
                <div v-else class="preview-video-container">
                  <div class="media-preview video-box">
                    <video :src="ver.videoUrl" class="v-thumb-player" muted></video>
                  </div>
                  <div class="media-actions">
                    <el-button size="small" type="primary" plain icon="MagicStick" circle title="重新复刻视频" @click="handleIndividualRestyle(post, 'video', vidx)"></el-button>
                    <el-button size="small" type="warning" plain icon="Refresh" circle title="手动更新视频" @click="editVersionVideo(post, vidx)"></el-button>
                    <el-button size="small" type="success" plain icon="Download" circle title="下载视频" @click="handleDownload(ver.videoUrl, `video_${post.postId}.mp4`)"></el-button>
                  </div>
                  <div class="v-label">复刻成果视频</div>
                </div>
              </div>
            </div>
          </div>

          <el-divider v-if="postList.indexOf(post) !== postList.length - 1" />
        </div>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
      </div>
    </el-card>

    <!-- 各类对话框 (文案/URL/环境) -->
    <!-- 文案快捷编辑 -->
    <el-dialog v-model="textEdit.visible" title="极速修正文案" width="500px">
      <el-form label-position="top">
        <el-form-item :label="textEdit.prop==='title'?'当前版标题':'当前版正文'">
          <el-input v-model="textEdit.value" :type="textEdit.prop==='title'?'text':'textarea'" :rows="8" />
        </el-form-item>
        <el-form-item label="发布状态">
          <el-switch v-model="textEdit.isUsed" active-text="已发" inactive-text="未发" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="textEdit.visible = false">取消</el-button>
        <el-button type="primary" @click="saveTextEdit">提交更新</el-button>
      </template>
    </el-dialog>

    <!-- 图片/视频 URL 登记对话框 -->
    <el-dialog v-model="urlDialog.visible" :title="urlDialog.title" width="500px">
      <el-input v-model="urlDialog.url" placeholder="请贴入 AI 复刻后的新 URL 地址..." type="textarea" :rows="3" />
      <template #footer>
        <el-button @click="urlDialog.visible = false">放弃</el-button>
        <el-button type="primary" @click="saveUrlEdit">确认入库</el-button>
      </template>
    </el-dialog>

    <!-- 全局图片/视频统一预览器 -->
    <el-image-viewer 
      v-if="pv.visible" 
      :url-list="pv.list" 
      :initial-index="pv.index"
      teleported
      @close="closePreview"
    />
  </div>
</template>

<script setup name="ScraperLibrary">
import { ref, reactive, onMounted } from 'vue';
import { listScraperPost, updateMedia, updateRestyle } from '@/api/business/scraper';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { Film, VideoPlay, Picture, Delete, CopyDocument, Refresh, CirclePlus, Download, MagicStick, Edit } from '@element-plus/icons-vue';
import axios from 'axios';
import FileSaver from 'file-saver';

const loading = ref(false);
const total = ref(0);
const postList = ref([]);
const queryParams = reactive({ pageNum: 1, pageSize: 12, platform: undefined, keyword: undefined });

// 复刻状态追踪
const restyleStatus = reactive({});

// 对话框数据
const textEdit = reactive({ visible: false, post: null, vidx: 0, prop: '', value: '', isUsed: false });
const urlDialog = reactive({ visible: false, post: null, vidx: 0, type: '', iidx: 0, url: '', title: '' });
const pv = reactive({ visible: false, list: [], index: 0 });

const getVersions = (p) => { try { return JSON.parse(p.restyleInfo || '[]'); } catch (e) { return []; } };
const getOriginalImgList = (p) => { try { return JSON.parse(p.images || '[]').map(i => i.urlDefault || i); } catch (e) { return []; } };
const getOriginalVideos = (p) => { try { return JSON.parse(p.videos || '[]'); } catch (e) { return []; } };

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await listScraperPost(queryParams);
    postList.value = res.data.records;
    total.value = res.data.total;
  } catch (e) { ElMessage.error('加载失败'); }
  finally { loading.value = false; }
};

const handleQuery = () => fetchList();

const handlePreviewImg = (url, list) => {
  if (!url) return;
  pv.list = list.filter(u => u && u.startsWith('http')).map(u => u);
  pv.index = pv.list.indexOf(url);
  if (pv.index === -1) {
    pv.list = [url];
    pv.index = 0;
  }
  pv.visible = true;
};
const closePreview = () => { pv.visible = false; };

const removeOriginalImage = (post, idx) => {
  ElMessageBox.confirm('确定移除这张原图吗？').then(async () => {
    try {
      let images = JSON.parse(post.images || '[]');
      images.splice(idx, 1);
      const imagesJson = JSON.stringify(images);

      let versions = getVersions(post);
      versions.forEach(ver => {
        if (ver.images) {
          ver.images = ver.images.filter(img => img.originalIndex !== idx);
          ver.images.forEach(img => {
            if (img.originalIndex > idx) img.originalIndex -= 1;
          });
        }
      });
      const restyleInfoJson = JSON.stringify(versions);

      await updateMedia({ scraperId: post.scraperId, images: imagesJson, videos: post.videos });
      await updateRestyle({ scraperId: post.scraperId, restyleInfo: restyleInfoJson });

      post.images = imagesJson;
      post.restyleInfo = restyleInfoJson;
      ElMessage.success('已同步库数据');
    } catch (e) { ElMessage.error('更新失败'); }
  });
};

const createNewVersion = async (post) => {
  const versions = getVersions(post);
  const imgList = getOriginalImgList(post);
  versions.push({
    title: post.title,
    content: post.content,
    isUsed: false,
    videoUrl: '',
    images: imgList.map((_, i) => ({ originalIndex: i, url: '' })),
    createTime: new Date().toISOString()
  });
  updateDB(post, versions);
};

const handleAutoRestyle = (post) => {
  ElMessage.warning('请在 AI 助手专用版中发起自动化任务，此网页仅供大板管理。');
};

const handleIndividualRestyle = (post, mode, vidx = 0) => {
  ElMessage.warning('请在 AI 助手专用版中发起独立任务，此网页仅供大板管理。');
};

const removeVersion = (post, vidx) => {
  ElMessageBox.confirm('确定废弃这个版本吗？').then(() => {
    const versions = getVersions(post);
    versions.splice(vidx, 1);
    updateDB(post, versions);
  });
};

const editVerProp = (post, vidx, prop) => {
  const versions = getVersions(post);
  textEdit.post = post;
  textEdit.vidx = vidx;
  textEdit.prop = prop;
  textEdit.value = versions[vidx][prop];
  textEdit.isUsed = versions[vidx].isUsed;
  textEdit.visible = true;
};

const saveTextEdit = () => {
  const versions = getVersions(textEdit.post);
  versions[textEdit.vidx][textEdit.prop] = textEdit.value;
  versions[textEdit.vidx].isUsed = textEdit.isUsed;
  updateDB(textEdit.post, versions, () => { textEdit.visible = false; });
};

const editImageRestyle = (post, vidx, iidx) => {
  const versions = getVersions(post);
  urlDialog.post = post;
  urlDialog.vidx = vidx;
  urlDialog.iidx = iidx;
  urlDialog.type = 'image';
  urlDialog.url = (versions[vidx].images[iidx] || {}).url || '';
  urlDialog.title = '登记复刻图 URL';
  urlDialog.visible = true;
};

const editVersionVideo = (post, vidx) => {
  const versions = getVersions(post);
  urlDialog.post = post;
  urlDialog.vidx = vidx;
  urlDialog.type = 'video';
  urlDialog.url = versions[vidx].videoUrl || '';
  urlDialog.title = '登记复刻视频 URL';
  urlDialog.visible = true;
};

const saveUrlEdit = () => {
  const versions = getVersions(urlDialog.post);
  if (urlDialog.type === 'video') {
    versions[urlDialog.vidx].videoUrl = urlDialog.url;
  } else {
    if(!versions[urlDialog.vidx].images[urlDialog.iidx]) versions[urlDialog.vidx].images[urlDialog.iidx] = { originalIndex: urlDialog.iidx };
    versions[urlDialog.vidx].images[urlDialog.iidx].url = urlDialog.url;
  }
  updateDB(urlDialog.post, versions, () => { urlDialog.visible = false; });
};

const updateDB = async (post, versions, callback) => {
  const jsonStr = JSON.stringify(versions);
  try {
    await updateRestyle({ scraperId: post.scraperId, restyleInfo: jsonStr });
    post.restyleInfo = jsonStr;
    if (callback) callback();
    ElMessage.success('操作成功');
  } catch (e) { ElMessage.error('更新失败'); }
};

const copy = (text) => {
  if (!text) return;
  
  const handleSuccess = () => ElMessage.success('已成功复制到剪贴板');
  const handleFail = () => ElMessage.error('复制失败，请手动长按选择复制');

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(handleSuccess).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }

  function fallbackCopy(val) {
    const textArea = document.createElement("textarea");
    textArea.value = val;
    // 确保不可见但可操作
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) handleSuccess();
      else handleFail();
    } catch (err) {
      handleFail();
    }
    document.body.removeChild(textArea);
  }
};
const openLink = (u) => window.open(u);

const handleDownload = async (url, filename) => {
  if (!url) return;
  const loadingInstance = ElLoading.service({ text: '正在下载素材...', background: 'rgba(0, 0, 0, 0.7)' });
  try {
    const response = await axios({
      url: url,
      method: 'GET',
      responseType: 'blob'
    });
    const blob = new Blob([response.data]);
    FileSaver.saveAs(blob, filename || 'material_' + Date.now());
    ElMessage.success('下载成功');
  } catch (e) {
    ElMessage.error('下载失败，请尝试右键另存为或检查网络');
  } finally {
    loadingInstance.close();
  }
};

const playOriginalVideo = (p) => { const v = getOriginalVideos(p); if (v.length > 0) window.open(v[0].url); };

onMounted(() => fetchList());
</script>

<style scoped>
.power-grid-container { min-height: calc(100vh - 84px); background: #fcfdfe; }
.main-card { border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.title-group { display: flex; align-items: center; gap: 15px; }
.logo-icon { font-size: 30px; color: #f59e0b; padding: 10px; background: rgba(245, 158, 11, 0.08); border-radius: 14px; }
.text h2 { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; }
.text p { margin: 2px 0 0; font-size: 12px; color: #64748b; }

.post-group { margin-top: 10px; }
.table-row { display: flex; border: 1px solid transparent; min-height: 140px; border-radius: 12px; }
.table-row:hover { background: #fff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

.cell-version-label { width: 90px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #f8fafc; border-radius: 12px 0 0 12px; border-right: 1px dashed #e2e8f0; }
.ref-tag { font-weight: 800; color: #94a3b8; font-size: 11px; }
.ver-badge { font-weight: 900; color: #f59e0b; font-size: 16px; }

.cell-text { width: 320px; padding: 15px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px dashed #e2e8f0; }
.original-title { font-weight: 700; color: #334155; margin-bottom: 6px; font-size: 14px; }
.original-body { font-size: 12px; color: #64748b; line-height: 1.6; }

.ver-title-row, .ver-content-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; cursor: pointer; padding: 6px 8px; border-radius: 8px; border: 1px solid transparent; position: relative; }
.ver-title-row:hover, .ver-content-row:hover { background: #f1f5f9; border-color: #cbd5e1; }
.v-title { font-weight: 700; color: #1e293b; flex: 1; }
.text-row-actions { display: flex; gap: 6px; flex-shrink: 0; }
.v-body { font-size: 12px; color: #475569; line-height: 1.6; }

.media-column-wrapper { flex: 1; display: flex; overflow-x: auto; padding: 15px; gap: 20px; }
.media-cell { width: 115px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 5px 0; }

.media-preview { position: relative; width: 90px; height: 90px; cursor: pointer; border-radius: 12px; overflow: hidden; }
.img-thumb, .v-thumb-player, .video-placeholder, .empty-box { width: 90px; height: 90px; border-radius: 10px; transition: transform 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
.img-thumb:hover { transform: scale(1.04); }

.media-actions { display: flex; justify-content: center; gap: 6px; width: 100%; min-height: 32px; align-items: center; }
.media-actions .el-button { margin: 0 !important; transform: scale(0.9); transition: transform 0.2s; }
.media-actions .el-button:active { transform: scale(0.8); }

.empty-video-container { display: flex; flex-direction: column; align-items: center; gap: 10px; }

.empty-box { background: #f8fafc; border: 2px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; font-size: 11px; gap: 4px; }
.empty-box:hover { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.02); }

.ver-border { border: 2px solid #f59e0b; }
.img-label { font-size: 11px; color: #94a3b8; margin-top: 0; text-align: center; font-weight: 500; }

.video-cell { border-left: 2px solid #f59e0b; padding-left: 15px !important; }
.video-placeholder { background: #1e293b; color: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; gap: 5px; }

.original-row { background: #f8fafc; border-top: 4px solid #94a3b8; border-bottom: 2px solid #e2e8f0; margin-top: 15px; }
.version-row { border-left: 6px solid #f59e0b; background: #fff; margin-top: 30px; padding-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* 移动端响应式适配 */
@media (max-width: 768px) {
  .table-row { flex-direction: column; height: auto !important; min-height: unset; padding-bottom: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
  
  .cell-version-label { 
    width: 100% !important; 
    flex-direction: row !important; 
    justify-content: space-between !important; 
    padding: 10px 15px !important; 
    border-right: none !important; 
    border-bottom: 1px dashed #e2e8f0; 
    border-radius: 12px 12px 0 0 !important;
  }
  .ver-badge { font-size: 14px; }

  .cell-text { 
    width: 100% !important; 
    padding: 15px !important; 
    border-right: none !important; 
    border-bottom: 1px dashed #e2e8f0;
  }
  .ver-title-row { margin-bottom: 10px; }

  .media-column-wrapper { 
    flex-wrap: wrap !important; 
    gap: 15px !important; 
    padding: 15px !important;
    overflow: visible !important;
  }
  .media-cell { 
    width: calc(33.33% - 14px) !important; 
    margin-bottom: 10px;
  }
  
  .video-cell { border-left: none !important; border-top: 2px solid #f59e0b; padding-top: 15px !important; padding-left: 0 !important; width: 100% !important; flex-direction: row !important; justify-content: flex-start !important; gap: 15px; }
  .empty-video-container, .preview-video-container { display: flex; align-items: center; gap: 15px; width: 100%; flex-direction: row !important; }
}
</style>
