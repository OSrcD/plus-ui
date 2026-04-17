<template>
  <div class="app-container video-reproduce-container">
    <!-- 顶部横幅 -->
    <el-card class="banner-card" shadow="never">
      <div class="banner-content">
        <h2 class="title"><el-icon style="margin-right:8px;color:#3b82f6"><VideoCamera /></el-icon>视频复刻工作台</h2>
        <p class="subtitle">AI 视频分析、自动截帧、洗图、视频复刻</p>
      </div>
      <div class="banner-actions">
        <el-button type="primary" icon="Plus" @click="showUploadDialog = true">
           新建视频复刻任务
        </el-button>
      </div>
    </el-card>

    <!-- 任务流水线看板 -->
    <div class="main-content">
      <div class="task-grid">
        <div v-for="task in taskList" :key="task.taskId" 
             class="task-card" 
             :class="{ active: currentTask?.taskId === task.taskId }"
             @click="selectTask(task)">
          <div class="card-header">
            <span class="task-id" :title="'完整ID: ' + task.taskId">任务号: {{ task.taskId.toString().slice(-6) }}</span>
            <div>
              <el-tag :type="getStatusType(task.status)" size="small">
                {{ getStatusLabel(task.status) }}
              </el-tag>
              <el-button type="danger" link icon="Delete" @click.stop="handleDelete(task)" style="margin-left: 8px;"></el-button>
            </div>
          </div>
          <div class="task-preview" @click.stop="task.originalVideoUrl ? openVideoPreview(task.originalVideoUrl) : null">
            <video v-if="task.originalVideoUrl" :src="task.originalVideoUrl" class="mini-video" muted @mouseover="playVideo" @mouseleave="pauseVideo"></video>
            <div class="play-overlay" v-if="task.originalVideoUrl"><el-icon><VideoPlay /></el-icon></div>
            <div v-else class="video-placeholder">无预览</div>
          </div>
          <div class="card-footer">
            <div class="time-info">
              <el-icon><Calendar /></el-icon> {{ parseTime(task.createTime) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 任务详情看板 -->
      <el-card v-if="currentTask" class="detail-board" shadow="never">
        <div class="detail-header">
          <h2>任务详情 <span class="badge">单元分析 (GU)</span></h2>
          <div class="actions">
             <el-button type="primary" plain @click="openWashDialog('all')">一键批量洗图</el-button>
             <el-button type="success" plain @click="handleBatchGenerate('api')">全量生成 (API收费)</el-button>
             <el-button type="success" plain @click="handleBatchGenerate('local')">全量生成 (本地免费)</el-button>
             <el-button type="warning" plain @click="handleMergeVideos">合成全片最终视频</el-button>
             <el-button type="info" plain @click="refreshFrames">刷新详情</el-button>
          </div>
        </div>

        <!-- 步骤进度 -->
        <div class="workflow-steps">
          <el-steps :active="parseInt(currentTask.status)" finish-status="success" align-center>
            <el-step title="视频分析" description="Gemini 多轮理解" />
            <el-step title="自动截帧" description="关键帧精准提取" />
            <el-step title="AI 洗图" description="Nano Banana 增强" />
            <el-step title="就绪" description="提示词已优化" />
          </el-steps>
        </div>

        <!-- 全局锁展示 -->
        <div v-if="globalLocks" class="locks-section">
          <h3>全片统一锁 (Global Locks)</h3>
          <div class="lock-grid">
            <div v-for="(val, key) in globalLocks" :key="key" class="lock-item">
              <span class="lock-key">{{ formatKey(key) }}</span>
              <p class="lock-val">{{ val }}</p>
            </div>
          </div>
        </div>

        <!-- 最终合成结果 -->
        <div v-if="currentTask.combinedVideoUrl" class="final-video-section glass-card">
          <div class="section-header">
            <h3><el-icon style="margin-right:8px;color:#10b981"><Film /></el-icon>全片合成结果 (Final Combined Video)</h3>
            <el-button type="success" icon="Download" @click="downloadUrl(currentTask.combinedVideoUrl)">下载全片</el-button>
          </div>
          <div class="video-container">
            <video :src="currentTask.combinedVideoUrl" controls class="final-video"></video>
          </div>
        </div>

        <!-- 捕获的截帧 & 洗图结果 -->
        <div v-loading="loadingFrames" class="frames-section">
          <h3>制作单元详情 (GUs)</h3>
          <div class="frame-list">
            <div v-for="frame in frames" :key="frame.frameId" class="frame-card glass-card">
              <div class="frame-header">
                <strong>制作单元 {{ frame.guId }}</strong>
                <span class="timestamp">原始时间点: {{ frame.timestampSec }}s</span>
              </div>
              <div class="comparison-view">
                <div class="img-box">
                  <span class="label">原始截帧</span>
                  <el-button class="add-material-btn" icon="Plus" circle size="small" type="primary" 
                             @click.stop="handleAddToMaterial(frame.originalImageUrl, `原帧_${currentTask.taskId}_${frame.guId}`)"
                             title="加入素材库"></el-button>
                  <el-image :src="frame.originalImageUrl" fit="cover" :preview-src-list="[frame.originalImageUrl]" />
                </div>
                <div class="arrow-icon">
                  <el-icon><Right /></el-icon>
                </div>
                <div class="img-box polished">
                  <span class="label">AI 洗图 (就绪)</span>
                  <el-button v-if="frame.polishedImageUrl" class="add-material-btn" icon="Plus" circle size="small" type="success" 
                             @click.stop="handleAddToMaterial(frame.polishedImageUrl, `洗图_${currentTask.taskId}_${frame.guId}`)"
                             title="加入素材库"></el-button>
                  <el-image :src="frame.polishedImageUrl || frame.originalImageUrl" fit="cover" 
                            :class="{ pulse: !frame.polishedImageUrl && currentTask.status === '3' }"
                            :preview-src-list="[frame.polishedImageUrl]" />
                </div>
              </div>
              <div class="frame-actions" style="margin-bottom: 12px; display: flex; gap: 10px;">
                  <el-button size="small" type="primary" plain @click="openWashDialog('single', frame.frameId)">🔄 洗图</el-button>
                  <el-button size="small" type="info" plain @click="openCaptureDialog(frame)">📸 手动调整截帧</el-button>
                  <el-button size="small" type="warning" plain v-if="frame.prevPolishedUrl" @click="doUndoWash(frame.frameId)">⏪ 撤回洗图</el-button>
                  <el-button size="small" type="success" plain @click="doGenerateVideo(frame.frameId, 'api')">🎬 生视频(API)</el-button>
                  <el-button size="small" type="success" plain @click="doGenerateVideo(frame.frameId, 'local')">🎬 生视频(本地)</el-button>
                  <el-button size="small" type="warning" plain v-if="frame.prevVideoUrl" @click="doUndoVideo(frame.frameId)">⏪ 撤回视频</el-button>
              </div>
              <div class="video-result" style="margin-bottom: 16px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                     <span class="label" :style="{ color: frame.generatedVideoUrl ? '#10b981' : '#94a3b8', fontWeight: 'bold' }">
                       {{ frame.generatedVideoUrl ? 'Veo 3.1 生成结果' : '等待视频生成 / 手动上传' }}
                     </span>
                     <div style="display: flex; gap: 8px;">
                        <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="(file) => handleGeneratedVideoUpload(frame, file)" accept="video/*">
                           <el-button size="small" :type="frame.generatedVideoUrl ? 'primary' : 'success'" plain icon="Upload">
                             {{ frame.generatedVideoUrl ? '手动替换' : '手动上传视频' }}
                           </el-button>
                        </el-upload>
                        <el-button v-if="frame.generatedVideoUrl" size="small" type="info" plain icon="Microphone" @click="downloadFrameAudio(frame)">音频</el-button>
                        <el-button v-if="frame.generatedVideoUrl" size="small" type="danger" plain @click="openClipDialog(frame)">剪辑</el-button>
                     </div>
                  </div>
                  <video v-if="frame.generatedVideoUrl" :src="frame.generatedVideoUrl" controls style="width: 100%; max-height: 240px; border-radius: 8px; margin-top: 8px; border: 1px solid rgba(255, 255, 255, 0.1);"></video>
                  <div v-else class="video-placeholder-empty">
                     <el-icon class="icon"><Film /></el-icon>
                     <span>暂无视频结果</span>
                  </div>
              </div>
              <div class="prompt-section prompt-en">
                <div class="prompt-header">
                   <span>模型提示词 (EN)</span>
                   <div class="actions">
                      <el-button link type="primary" @click="toggleEditPrompt(frame)">{{ frame.editing ? '取消' : '编辑' }}</el-button>
                      <el-button v-if="frame.editing" link type="success" @click="savePrompts(frame)">保存修改</el-button>
                      <el-button link type="primary" @click="copyText(frame.i2vPromptEn)">复制提示词</el-button>
                   </div>
                </div>
                <div v-if="!frame.editing" class="prompt-text en-text">{{ frame.i2vPromptEn }}</div>
                <el-input v-else v-model="frame.i2vPromptEn" type="textarea" :rows="6" class="prompt-edit-area"></el-input>
              </div>

              <div v-if="frame.i2vPromptZh || frame.editing" class="prompt-section prompt-zh">
                <div class="prompt-header">
                   <span>中文对照</span>
                   <el-button v-if="!frame.editing" link type="primary" @click="copyText(frame.i2vPromptZh)">复制中文</el-button>
                </div>
                <div v-if="!frame.editing" class="prompt-text zh-text">{{ frame.i2vPromptZh }}</div>
                <el-input v-else v-model="frame.i2vPromptZh" type="textarea" :rows="3" class="prompt-edit-area"></el-input>
              </div>

              <!-- 音频管理模块 -->
              <div class="audio-management glass-card">
                 <div class="section-header">
                    <span class="label"><el-icon><Microphone /></el-icon> 音频 & 口型同步</span>
                    <el-button v-if="frame.audioUrl" type="primary" link @click="openAudioTrimDialog(frame)">手动裁剪</el-button>
                 </div>
                 
                 <div v-if="!frame.audioUrl" class="audio-upload-placeholder">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="(file) => handleAudioUpload(frame, file)"
                      accept="audio/*"
                    >
                      <el-button size="small" type="primary" plain icon="Upload">上传同步音频</el-button>
                    </el-upload>
                    <span class="tip">配合对准口型 (支持 .mp3, .wav)</span>
                 </div>

                 <div v-else class="audio-active-zone">
                    <audio :src="frame.audioUrl" controls class="mini-audio-player"></audio>
                    <div class="audio-actions">
                       <el-button size="small" type="success" plain @click="doAutoTrimAudio(frame.frameId)" :loading="trimming">一键自动去静音</el-button>
                       <el-button size="small" type="warning" plain @click="doSyncAudioToVideo(frame.frameId)" :loading="syncing">同步至视频/口型</el-button>
                       <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="(file) => handleAudioUpload(frame, file)" style="display:inline-block; margin-left:8px;">
                          <el-button size="small" link type="primary">重新上传</el-button>
                       </el-upload>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="发起新的视频复刻流水线" width="600px" append-to-body>
      <el-form :model="uploadForm" label-position="top" class="custom-form">
        <el-form-item label="原始对标视频" required>
           <el-upload
            class="video-uploader"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleVideoChange"
          >
            <el-icon class="uploader-icon"><VideoCamera /></el-icon>
            <div class="el-upload__text">点击或将视频文件拖拽到此处</div>
          </el-upload>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人物参考图">
               <el-upload action="#" list-type="picture-card" :auto-upload="false" multiple :on-change="handleCharChange">
                  <el-icon><Plus /></el-icon>
               </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品参考图">
               <el-upload action="#" list-type="picture-card" :auto-upload="false" multiple :on-change="handleProdChange">
                  <el-icon><Plus /></el-icon>
               </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">产品背景配置 (选填)</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品牌/产品名称">
              <el-input v-model="uploadForm.brandOrProductName" placeholder="[填写]" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标用户群体">
              <el-input v-model="uploadForm.targetAudience" placeholder="[填写]" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="产品核心卖点">
          <el-input v-model="uploadForm.coreSellingPoints" type="textarea" :rows="2" placeholder="[填写，最多3条]" />
        </el-form-item>
        
        <el-form-item label="要解决的痛点" style="margin-bottom: 0px;"></el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item>
              <el-input v-model="uploadForm.painPoint1" placeholder="痛点一: [填写]" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-input v-model="uploadForm.painPoint2" placeholder="痛点二: [填写]" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-input v-model="uploadForm.painPoint3" placeholder="痛点三: [填写]" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">运行偏好设置</el-divider>
        <el-form-item label="任务首发执行引擎 (分析原视频)">
          <el-radio-group v-model="uploadForm.execMode">
            <el-radio-button label="api">调用平台大模型API (全自动处理)</el-radio-button>
            <el-radio-button label="local">本地全自动监听队列 (免费，依赖客户端节点)</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button type="primary" :loading="uploading" @click="submitTask">开启流水线</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 洗图工作台对话框 -->
    <el-dialog v-model="showWashDialog" title="洗图工作台 (Nano Banana)" width="650px" append-to-body>
      <el-form :model="washForm" label-position="top" class="custom-form">
        <el-form-item label="任务执行模式">
          <el-radio-group v-model="washForm.execMode">
            <el-radio label="api">API 模式 (扣费极速)</el-radio>
            <el-radio label="local">本地机器模式 (排队免费)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="创作模式">
          <el-radio-group v-model="washForm.washMode" style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
            <el-radio label="original">原图 - 智能融合</el-radio>
            <el-radio label="restyled">复刻图 - 二次加工</el-radio>
            <el-radio label="original_pure">原图 - 纯文生图</el-radio>
            <el-radio label="restyled_pure">复刻图 - 纯文生图</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="自定义提示词 (可选)">
          <el-input v-model="washForm.customPrompt" type="textarea" :rows="3" placeholder="追加特定的洗图要求，例如改变风格、修改服装等..." />
        </el-form-item>

        <el-form-item label="素材库参考图 (可选，点击选择，可多选)">
          <div class="material-picker-list" v-loading="loadingMaterials">
             <div v-for="item in materialList" :key="item.materialId" class="material-picker-item" 
                  :class="{ selected: materialSelection.includes(item.materialUrl) }"
                  @click="toggleMaterialSelection(item.materialUrl)">
                <el-image :src="item.materialUrl" fit="cover" class="mp-img"/>
                <div class="selected-overlay" v-if="materialSelection.includes(item.materialUrl)">
                   <el-icon><Check /></el-icon>
                </div>
             </div>
             <el-empty v-if="materialList.length === 0" description="暂无素材" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showWashDialog = false">取消</el-button>
          <el-button type="primary" :loading="washing" @click="submitWash">开始生成</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 视频全屏预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="原视频预览" width="700px" append-to-body destroy-on-close>
      <div v-if="previewVideoUrl" style="display:flex; justify-content:center; align-items:center;">
        <video :src="previewVideoUrl" controls autoplay style="max-width: 100%; max-height: 60vh; border-radius: 8px;"></video>
      </div>
    </el-dialog>

    <!-- 视频剪辑对话框 -->
    <el-dialog v-model="showClipDialog" title="视频高级可视剪辑" width="850px" append-to-body destroy-on-close>
      <div v-if="clipVideoUrl" style="margin-bottom: 20px; text-align: center;">
        <video ref="clipVideoRef" :src="clipVideoUrl" style="width: 100%; max-height: 450px; border-radius: 8px; background: #000; cursor: pointer;" @loadedmetadata="onVideoLoaded" @click="toggleClipPlay"></video>
        <div style="margin-top: 10px;">
          <el-button @click="toggleClipPlay" size="small" type="primary" plain round>
            <el-icon style="margin-right: 4px"><VideoPlay /></el-icon> 播放 / 暂停
          </el-button>
        </div>
      </div>

      <div style="margin-bottom: 10px; color: #666; font-size: 13px;">
        请拖动下方滑块指定<b style="color:#f56c6c;">需要剪除（不要的部分）</b>的时间区间。拖动滑块时上方画面会自动定位到对应帧，方便您精准定位瑕疵位置。
      </div>

      <div v-for="(range, idx) in clipRanges" :key="idx" style="margin-bottom: 15px; background: #f5f7fa; padding: 10px 15px; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
           <span style="font-size: 14px; font-weight: bold;">剪除区间 {{ idx + 1 }}</span>
           <el-button type="danger" link @click="clipRanges.splice(idx, 1)" v-if="clipRanges.length > 1">移除本段</el-button>
        </div>
        <el-slider
           v-model="range.val" 
           range 
           :max="videoDuration" 
           :step="0.05" 
           @input="(val) => seekToSlider(val, idx)"
        ></el-slider>
        <div style="display:flex; justify-content:space-between; font-size: 12px; color: #999;">
           <span>{{ range.val[0].toFixed(2) }}s</span>
           <span>{{ range.val[1].toFixed(2) }}s</span>
        </div>
      </div>
      
      <el-button type="primary" plain @click="clipRanges.push({val: [0, videoDuration * 0.2 || 1], _prev: [0, 0]})" icon="Plus" style="width: 100%;">新增剪除区间</el-button>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showClipDialog = false">取消</el-button>
          <el-button type="danger" :loading="clipping" @click="submitClip">确认剪切合成</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 音频裁剪对话框 -->
    <el-dialog v-model="showAudioTrimDialog" title="音频精准裁剪" width="600px" append-to-body destroy-on-close>
       <div v-if="trimAudioUrl" style="text-align: center; margin-bottom: 20px;">
          <audio ref="trimAudioRef" :src="trimAudioUrl" controls style="width: 100%;" @loadedmetadata="onAudioLoaded"></audio>
       </div>
       <div style="margin-bottom: 10px; font-size: 13px; color: #666;">
          请拖动滑块选择需要<b>保留</b>的音频区间：
       </div>
       <el-slider v-model="audioTrimRange" range :max="audioDuration" :step="0.01" @input="seekAudioToSlider"></el-slider>
       <div style="display:flex; justify-content:space-between; font-size: 12px; color: #999; margin-top:5px;">
          <span>起始点: {{ audioTrimRange[0].toFixed(2) }}s</span>
          <span>结束点: {{ audioTrimRange[1].toFixed(2) }}s</span>
          <span>裁剪后总长: {{ (audioTrimRange[1] - audioTrimRange[0]).toFixed(2) }}s</span>
       </div>
       <template #footer>
          <span class="dialog-footer">
            <el-button @click="showAudioTrimDialog = false">取消</el-button>
            <el-button type="primary" :loading="trimming" @click="submitManualAudioTrim">执行裁剪</el-button>
          </span>
       </template>
    </el-dialog>

    <!-- 关键帧手动截取对话框 -->
    <el-dialog v-model="showCaptureDialog" title="手动捕捉关键帧" width="800px" append-to-body destroy-on-close>
      <div v-if="captureVideoUrl" style="margin-bottom: 20px; text-align: center;">
        <video ref="captureVideoRef" :src="captureVideoUrl" style="width: 100%; max-height: 450px; border-radius: 8px; background: #000; cursor: pointer;" @loadedmetadata="onCaptureVideoLoaded" @click="toggleCapturePlay" @timeupdate="onCaptureTimeUpdate"></video>
        <div style="margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 15px;">
          <el-button @click="toggleCapturePlay" size="small" type="primary" plain round>
            <el-icon style="margin-right: 4px"><VideoPlay /></el-icon> 播放 / 暂停
          </el-button>
          <div style="font-weight: bold; font-family: monospace; font-size: 16px; color: #409eff;">
            当前位置: {{ captureTime.toFixed(3) }}s
          </div>
        </div>
      </div>
      <div style="padding: 0 20px;">
        <el-slider v-model="captureTime" :max="videoDuration" :step="0.001" @input="seekToCaptureTime"></el-slider>
        <div style="margin-top: 10px; color: #666; font-size: 13px;">
          请拖动上方滑块，或直接点击视频画面定位到您认为最准确的一帧作为素材。
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCaptureDialog = false">取消</el-button>
          <el-button type="primary" :loading="capturing" @click="submitCapture">确认截取并替换</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Plus, VideoCamera, Calendar, Right, Check, VideoPlay, Delete, Film, Download, Microphone, Upload, Edit } from '@element-plus/icons-vue'
import { listVideoReproduce, createVideoReproduce, getFrames, generateAllVideos, washImage, washAllImages, undoWash, generateVideo, undoVideo, delVideoReproduce, clipVideo, mergeVideos, bindAudio, autoTrimAudio, manualTrimAudio, syncAudioToVideo, updatePrompts, recaptureFrame, uploadGeneratedVideo, downloadAudio } from '@/api/business/videoReproduce'
import { listMaterial } from '@/api/business/material'
import { addMaterial } from '@/api/business/material'
import { parseTime } from "@/utils/ruoyi";
import { getToken } from "@/utils/auth";
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

const taskList = ref([])
const currentTask = ref(null)
const frames = ref([])
const loadingFrames = ref(false)
const showUploadDialog = ref(false)
const uploading = ref(false)

// 视频预览状态
const showPreviewDialog = ref(false)
const previewVideoUrl = ref('')

const openVideoPreview = (url) => {
    previewVideoUrl.value = url
    showPreviewDialog.value = true
}

// 视频剪辑状态
const showClipDialog = ref(false)
const clipping = ref(false)
const clipTargetFrameId = ref(null)
const clipVideoUrl = ref('')
const clipRanges = ref([{ val: [0, 0], _prev: [0, 0] }])
const clipVideoRef = ref(null)
const videoDuration = ref(10.0) // 默认兜底，加载后更新

const openClipDialog = (frame) => {
    clipTargetFrameId.value = frame.frameId
    clipVideoUrl.value = frame.generatedVideoUrl
    clipRanges.value = [{ val: [0, 1.0], _prev: [0, 1.0] }] // 给定一点默认值以区分
    showClipDialog.value = true
}

const toggleClipPlay = () => {
    if (clipVideoRef.value) {
        if (clipVideoRef.value.paused) {
            clipVideoRef.value.play()
        } else {
            clipVideoRef.value.pause()
        }
    }
}

const onVideoLoaded = (e) => {
    videoDuration.value = e.target.duration
    // 更新默认区间的上限
    if (clipRanges.value.length === 1 && clipRanges.value[0].val[1] === 1.0) {
        clipRanges.value[0].val[1] = Math.min(1.0, e.target.duration)
    }
}

const seekToSlider = (val, idx) => {
    const prev = clipRanges.value[idx]._prev || [0, 0]
    // 找出哪个点动了
    if (val[0] !== prev[0]) {
        if (clipVideoRef.value) clipVideoRef.value.currentTime = val[0]
    } else if (val[1] !== prev[1]) {
        if (clipVideoRef.value) clipVideoRef.value.currentTime = val[1]
    }
    clipRanges.value[idx]._prev = [...val]
}

// 手动截帧状态
const showCaptureDialog = ref(false)
const capturing = ref(false)
const captureTargetFrameId = ref(null)
const captureVideoUrl = ref('')
const captureTime = ref(0)
const captureVideoRef = ref(null)

const openCaptureDialog = (frame) => {
    captureTargetFrameId.value = frame.frameId
    captureVideoUrl.value = currentTask.value.originalVideoUrl
    captureTime.value = parseFloat(frame.timestampSec) || 0
    showCaptureDialog.value = true
}

const onCaptureVideoLoaded = (e) => {
    videoDuration.value = e.target.duration
    if (captureVideoRef.value) {
        captureVideoRef.value.currentTime = captureTime.value
    }
}

const onCaptureTimeUpdate = (e) => {
    // 只有在视频播放时才同步进度条给 captureTime，避免拖动滑块时循环触发
    if (captureVideoRef.value && !captureVideoRef.value.paused) {
        captureTime.value = e.target.currentTime
    }
}

const seekToCaptureTime = (val) => {
    if (captureVideoRef.value) {
        captureVideoRef.value.currentTime = val
        captureTime.value = val
    }
}

const toggleCapturePlay = () => {
    if (captureVideoRef.value) {
        if (captureVideoRef.value.paused) {
            captureVideoRef.value.play()
        } else {
            captureVideoRef.value.pause()
        }
    }
}

const submitCapture = async () => {
    if (!captureTargetFrameId.value) return
    capturing.value = true
    try {
        await recaptureFrame(captureTargetFrameId.value, captureTime.value)
        ElMessage.success('关键帧已更新')
        showCaptureDialog.value = false
        refreshFrames()
    } catch (e) {
        console.error(e)
    } finally {
        capturing.value = false
    }
}

// 手动上传生成视频逻辑
const handleGeneratedVideoUpload = async (frame, file) => {
    if (!file || !file.raw) return
    
    const loading = ElLoading.service({
        lock: true,
        text: '正在上传视频并替换结果...',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    
    try {
        await uploadGeneratedVideo(frame.frameId, file.raw)
        ElMessage.success('视频文件已成功替换')
        refreshFrames()
    } catch (e) {
        console.error(e)
        ElMessage.error('视频上传失败')
    } finally {
        loading.close()
    }
}

// 下载视频中的音频
const downloadFrameAudio = async (frame) => {
    const loading = ElLoading.service({
        lock: true,
        text: '正在提取音频...',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    try {
        const response = await downloadAudio(frame.frameId)
        
        // 这里的 response 已经是 blob 了，因为 request 里的 responseType: 'blob'
        // 如果后端报错，request 的拦截器通常会处理成 JSON 错误弹窗
        const blob = new Blob([response], { type: 'audio/mpeg' })
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `GU_${frame.guId}_Audio.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(downloadUrl)
        ElMessage.success('音频下载成功')
    } catch (e) {
        console.error(e)
        // 错误通常已经被拦截器处理了，这里做兜底
    } finally {
        loading.close()
    }
}

// 加入素材库
const handleAddToMaterial = async (url, name) => {
    if (!url) return ElMessage.warning('无效的图片地址')
    try {
        await addMaterial({
            materialName: name,
            materialUrl: url,
            fileType: '0' // 0 图片
        })
        ElMessage.success('已添加到素材库')
    } catch (e) {
        ElMessage.error('添加失败')
    }
}

const submitClip = async () => {
    const validRanges = clipRanges.value.filter(r => r.val[1] > r.val[0]).map(r => ({
        start: r.val[0],
        end: r.val[1]
    }))
    if (validRanges.length === 0) {
        ElMessage.warning('请配置至少一个有效的待剪截除区间（结束时间需大于开始时间）！')
        return
    }
    try {
        clipping.value = true
        await clipVideo(clipTargetFrameId.value, validRanges)
        ElMessage.success('剪切合成已完成！')
        showClipDialog.value = false
        refreshFrames()
    } catch (e) {
        // 请求失败报错
    } finally {
        clipping.value = false
    }
}

// 洗图表单状态
const showWashDialog = ref(false)
const washing = ref(false)
const washType = ref('single') // single or all
const washTargetFrameId = ref(null)
const washForm = ref({
  execMode: 'api',
  washMode: 'original',
  customPrompt: ''
})

const materialList = ref([])
const loadingMaterials = ref(false)
const materialSelection = ref([]) // 选中的素材 url 数组

const uploadForm = ref({
  video: null,
  charImages: [],
  productImages: [],
  brandOrProductName: '',
  targetAudience: '',
  coreSellingPoints: '',
  painPoint1: '',
  painPoint2: '',
  painPoint3: '',
  productConfigJson: '',
  execMode: 'api'
})

const getList = async () => {
    const res = await listVideoReproduce({ pageNum: 1, pageSize: 20 })
    taskList.value = res.rows
    if (taskList.value.length > 0 && !currentTask.value) {
        selectTask(taskList.value[0])
    }
}

const selectTask = (task) => {
    currentTask.value = task
    refreshFrames()
}

const refreshFrames = async () => {
    if (!currentTask.value) return
    loadingFrames.value = true
    try {
        const res = await getFrames(currentTask.value.taskId)
        const sortedData = (res.data || []).sort((a, b) => {
            const guA = parseInt(a.guId) || 0;
            const guB = parseInt(b.guId) || 0;
            return guA - guB;
        });
        frames.value = sortedData.map(f => ({
            ...f,
            editing: false,
            origEn: f.i2vPromptEn,
            origZh: f.i2vPromptZh
        }))
    } finally {
        loadingFrames.value = false
    }
}

const toggleEditPrompt = (frame) => {
    if (frame.editing) {
        frame.i2vPromptEn = frame.origEn
        frame.i2vPromptZh = frame.origZh
    } else {
        frame.origEn = frame.i2vPromptEn
        frame.origZh = frame.i2vPromptZh
    }
    frame.editing = !frame.editing
}

const savePrompts = async (frame) => {
    try {
        await updatePrompts(frame.frameId, frame.i2vPromptEn, frame.i2vPromptZh)
        ElMessage.success('提示词更新成功')
        frame.editing = false
        frame.origEn = frame.i2vPromptEn
        frame.origZh = frame.i2vPromptZh
    } catch (e) {
        ElMessage.error('更新失败')
    }
}

const globalLocks = computed(() => {
    if (!currentTask.value?.globalLocks) return null
    try {
        return JSON.parse(currentTask.value.globalLocks)
    } catch {
        return null
    }
})

const formatKey = (key) => {
    const map = {
        character_lock: '人物锁',
        product_lock: '商品锁',
        no_packaging_lock: '禁包装锁',
        visual_consistency_lock: '画面统一锁',
        voice_lock: '语音锁',
        audio_visual_mode_lock: '音画模式锁',
        tail_lock: '尾段锁'
    }
    return map[key] || key.replace(/_/g, ' ').toUpperCase()
}

const handleVideoChange = (file) => { uploadForm.value.video = file.raw }
const handleCharChange = (file, list) => { uploadForm.value.charImages = list.map(i => i.raw) }
const handleProdChange = (file, list) => { uploadForm.value.productImages = list.map(i => i.raw) }

const submitTask = async () => {
    if (!uploadForm.value.video) return ElMessage.warning('请选择对标视频')
    
    // 组装JSON配置
    const configObj = {
        "brandName": uploadForm.value.brandOrProductName,
        "sellingPoints": uploadForm.value.coreSellingPoints,
        "targetAudience": uploadForm.value.targetAudience,
        "painPoints": [
            uploadForm.value.painPoint1,
            uploadForm.value.painPoint2,
            uploadForm.value.painPoint3
        ]
    }
    uploadForm.value.productConfigJson = JSON.stringify(configObj)

    uploading.value = true
    try {
        const formData = new FormData()
        formData.append('video', uploadForm.value.video)
        formData.append('productConfigJson', uploadForm.value.productConfigJson)
        formData.append('execMode', uploadForm.value.execMode)
        uploadForm.value.charImages.forEach(i => formData.append('charImages', i))
        uploadForm.value.productImages.forEach(i => formData.append('productImages', i))
        
        await createVideoReproduce(formData)
        ElMessage.success('任务启动成功')
        showUploadDialog.value = false
        getList()
    } finally {
        uploading.value = false
    }
}

const playVideo = (e) => e.target.play()
const pauseVideo = (e) => e.target.pause()

const copyText = (text) => {
    navigator.clipboard.writeText(text)
    ElMessage.success('提示词已复制到剪贴板')
}

const handleBatchGenerate = async (execMode = 'api') => {
    const tip = execMode === 'local' ? '调用本地测试机器自动产生，速度慢但免费' : '调用 Veo 3.1 官方 API 接口，速度快但成本较高';
    try {
        await ElMessageBox.confirm(`确定要为该任务下所有截帧批量生成视频吗？\n(${tip})`, '执行确认', {
            confirmButtonText: '确定提交',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await generateAllVideos(currentTask.value.taskId, execMode)
        ElMessage.success(`已发送批量生成请求 (${execMode === 'local' ? '本地排队中' : '全量API触发'})`)
        refreshFrames()
    } catch (e) {
        // 取消操作
    }
}

const handleDelete = async (task) => {
    try {
        await ElMessageBox.confirm(`确定删除任务号为 [${task.taskId.toString().slice(-6)}] 的任务吗？这将级联删除其所有截帧！`, '警告', {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await delVideoReproduce(task.taskId)
        ElMessage.success('删除成功')
        if (currentTask.value && currentTask.value.taskId === task.taskId) {
            currentTask.value = null
            frames.value = []
        }
        getList()
    } catch (e) {
        // 用户取消或删除失败
    }
}

const fetchMaterials = async () => {
    loadingMaterials.value = true
    try {
        const res = await listMaterial({ pageNum: 1, pageSize: 50 })
        materialList.value = res.rows
    } catch(e) {
        ElMessage.error('获取素材库失败')
    } finally {
        loadingMaterials.value = false
    }
}

const toggleMaterialSelection = (url) => {
    const idx = materialSelection.value.indexOf(url)
    if (idx > -1) {
        materialSelection.value.splice(idx, 1)
    } else {
        materialSelection.value.push(url)
    }
}

// 打开洗图对话框
const openWashDialog = (type, frameId = null) => {
    washType.value = type
    washTargetFrameId.value = frameId
    washForm.value = { execMode: 'api', washMode: 'original', customPrompt: '' }
    materialSelection.value = []
    showWashDialog.value = true
    if (materialList.value.length === 0) {
        fetchMaterials()
    }
}

// 提交洗图请求
const submitWash = async () => {
    const refImagesArray = materialSelection.value
    const params = {
        execMode: washForm.value.execMode,
        washMode: washForm.value.washMode,
        customPrompt: washForm.value.customPrompt,
        refImages: refImagesArray
    }
    
    washing.value = true
    try {
        if (washType.value === 'single') {
            await washImage(washTargetFrameId.value, params)
            ElMessage.success('洗图请求已受理')
        } else {
            await washAllImages(currentTask.value.taskId, params)
            ElMessage.success('一键批量洗图已受理')
        }
        showWashDialog.value = false
        refreshFrames()
    } finally {
        washing.value = false
    }
}

const doUndoWash = async (frameId) => {
    await undoWash(frameId)
    ElMessage.success('已撤回最新洗图')
    refreshFrames()
}

const doGenerateVideo = async (frameId, execMode = 'api') => {
    const tip = execMode === 'local' ? '调用本地测试机器生成，需要排队' : '调用 API 接口生成，会有额度扣费！';
    try {
        await ElMessageBox.confirm(`确定要对此单帧生成视频吗？(${tip})`, '执行确认', {
            confirmButtonText: '立即生成',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await generateVideo(frameId, execMode)
        ElMessage.success(`已发送生视频请求 (${execMode === 'local' ? '本地队列中' : '请求API中'})`)
        refreshFrames()
    } catch (e) {
        // 取消操作
    }
}

const doUndoVideo = async (frameId) => {
    await undoVideo(frameId)
    ElMessage.success('已撤回最新视频')
    refreshFrames()
}

const merging = ref(false)
const handleMergeVideos = async () => {
    try {
        await ElMessageBox.confirm('确定要按照单元顺序合成全片视频吗？这将包含所有已生成的视频片段。', '合成确认', {
            confirmButtonText: '开始合成',
            cancelButtonText: '取消',
            type: 'info'
        })
        merging.value = true
        await mergeVideos(currentTask.value.taskId)
        ElMessage.success('合成任务已提交，请稍后刷新查看结果')
        // 自动刷新以便获取新出来的 combinedVideoUrl
        setTimeout(() => getList(), 3000)
    } catch (e) {
        // 取消
    } finally {
        merging.value = false
    }
}

const downloadUrl = (url) => {
    window.open(url, '_blank')
}

// 音频管理逻辑
const trimming = ref(false)
const syncing = ref(false)
const showAudioTrimDialog = ref(false)
const trimAudioUrl = ref('')
const trimAudioTargetFrameId = ref(null)
const audioTrimRange = ref([0, 0])
const audioDuration = ref(0)
const trimAudioRef = ref(null)

const handleAudioUpload = async (frame, file) => {
    try {
        ElMessage.info('正在上传音频...')
        await bindAudio(frame.frameId, file.raw)
        ElMessage.success('音频绑定成功')
        refreshFrames()
    } catch (e) {}
}

const doAutoTrimAudio = async (frameId) => {
    try {
        trimming.value = true
        await autoTrimAudio(frameId)
        ElMessage.success('自动去静音处理完成')
        refreshFrames()
    } finally {
        trimming.value = false
    }
}

const doSyncAudioToVideo = async (frameId) => {
    try {
        syncing.value = true
        await syncAudioToVideo(frameId)
        ElMessage.success('音画同步合成完成')
        refreshFrames()
    } finally {
        syncing.value = false
    }
}

const openAudioTrimDialog = (frame) => {
    trimAudioTargetFrameId.value = frame.frameId
    trimAudioUrl.value = frame.audioUrl
    audioTrimRange.value = [0, 1] // 初始值
    showAudioTrimDialog.value = true
}

const onAudioLoaded = (e) => {
    audioDuration.value = e.target.duration
    audioTrimRange.value = [0, e.target.duration]
}

const seekAudioToSlider = (val) => {
    if (trimAudioRef.value) {
        trimAudioRef.value.currentTime = val[0]
    }
}

const submitManualAudioTrim = async () => {
    try {
        trimming.value = true
        await manualTrimAudio(trimAudioTargetFrameId.value, audioTrimRange.value[0], audioTrimRange.value[1])
        ElMessage.success('手动裁剪应用成功')
        showAudioTrimDialog.value = false
        refreshFrames()
    } finally {
        trimming.value = false
    }
}

const getStatusType = (status) => {
  switch (status) {
    case '0': return 'info'
    case '1':
    case '2':
    case '3': return 'warning'
    case '4': return 'success'
    case '9': return 'danger'
    default: return 'info'
  }
}

const getStatusLabel = (status) => {
  const map = { '0': '等待中', '1': '分析中', '2': '截帧中', '3': '洗图中', '4': '已完成', '9': '失败' }
  return map[status] || '未知状态'
}

let autoRefreshTimer = null

onMounted(() => {
    getList()
    // 每 1 分钟自动刷新一次任务列表和当前截帧详情，保持页面状态最新
    autoRefreshTimer = setInterval(() => {
        getList()
        if (currentTask.value) {
            refreshFrames()
        }
    }, 60000)
})

onUnmounted(() => {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer)
        autoRefreshTimer = null
    }
})
</script>

<style scoped>
.video-reproduce-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}

.banner-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.banner-content .title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
}

.banner-content .subtitle {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.banner-card :deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-content {
  display: flex;
  gap: 20px;
}

.task-grid {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 8px;
  flex-shrink: 0;
}

.task-card {
  border: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--el-box-shadow-light);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow);
  border-color: var(--el-color-primary-light-5);
}

.task-card.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-id {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.task-preview {
  height: 140px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  color: rgba(255, 255, 255, 0.8);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.task-preview:hover .play-overlay {
  opacity: 1;
}

.mini-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.time-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-board {
  flex: 1;
  min-width: 0;
  border-radius: 8px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.detail-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
}

.badge {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 12px;
  font-weight: normal;
}

.workflow-steps {
  margin: 30px 0;
}

.lock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.lock-item {
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.lock-key {
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: bold;
}

.lock-val {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

.frames-section {
  margin-top: 40px;
}

.frame-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.final-video-section {
  margin: 30px 0;
  padding: 24px;
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
  border-radius: 12px;
}

.final-video-section h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.final-video-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.final-video-section .video-container {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.prompt-edit-area {
  margin-top: 8px;
  font-family: inherit;
}

.prompt-edit-area :deep(.el-textarea__inner) {
  background: rgba(255,255,255,0.05);
  border-color: var(--el-color-primary-light-5);
  color: var(--el-text-color-primary);
}

.final-video {
  width: 100%;
  max-height: 500px;
  display: block;
}

.audio-management {
  margin-top: 16px;
  padding: 16px;
  background: var(--el-color-primary-light-9);
  border: 1px dashed var(--el-color-primary-light-3);
  border-radius: 8px;
}

.audio-management .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.audio-management .label {
  font-size: 14px;
  font-weight: bold;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.audio-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.audio-upload-placeholder .tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mini-audio-player {
  width: 100%;
  height: 32px;
  margin-bottom: 12px;
}

.audio-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.frame-card {
  padding: 24px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background-color: var(--el-bg-color);
}

.frame-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.frame-header strong {
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.timestamp {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.comparison-view {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.img-box {
  flex: 1;
  position: relative;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.img-box .label {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}

.img-box .el-image {
  border-radius: 6px;
  width: 100%;
  height: 240px;
  display: block;
}

.add-material-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 11;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.img-box:hover .add-material-btn {
  opacity: 1;
}

.arrow-icon {
  font-size: 24px;
  color: var(--el-text-color-secondary);
}

.prompt-section {
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.prompt-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  white-space: pre-wrap;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.prompt-zh {
  margin-top: 12px;
  border-left: 4px solid var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.zh-text {
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  color: var(--el-text-color-primary);
}

/* Material Picker Custom Styles */
.material-picker-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 260px;
  overflow-y: auto;
  padding: 8px 4px;
}

.material-picker-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.material-picker-item:hover {
  transform: scale(1.05);
}

.material-picker-item.selected {
  border-color: var(--el-color-primary);
  transform: scale(1.02);
}

.mp-img {
  width: 100%;
  height: 100%;
  display: block;
}

.selected-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(64, 158, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
}

.task-grid::-webkit-scrollbar { width: 6px; }
.task-grid::-webkit-scrollbar-thumb { background: var(--el-border-color); border-radius: 10px; }
.material-picker-list::-webkit-scrollbar { width: 6px; }
.material-picker-list::-webkit-scrollbar-thumb { background: var(--el-border-color); border-radius: 10px; }

.video-placeholder-empty {
  height: 240px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  gap: 10px;
}

.video-placeholder-empty .icon {
  font-size: 32px;
  opacity: 0.5;
}
</style>
