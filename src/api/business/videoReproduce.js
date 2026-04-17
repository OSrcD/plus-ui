import request from '@/utils/request'

// 查询视频复刻任务列表
export function listVideoReproduce(query) {
  return request({
    url: '/business/videoReproduce/list',
    method: 'get',
    params: query
  })
}

// 创建并开始复刻任务
export function createVideoReproduce(data) {
  return request({
    url: '/business/videoReproduce/create',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 重试任务
export function retryVideoReproduce(taskId) {
  return request({
    url: '/business/videoReproduce/retry/' + taskId,
    method: 'post'
  })
}

// 一键生成视频
export function generateAllVideos(taskId, execMode = 'api') {
  return request({
    url: '/business/videoReproduce/generateAll/' + taskId,
    method: 'post',
    params: { execMode }
  })
}

// 获取截帧详情
export function getFrames(taskId) {
  return request({
    url: '/business/videoReproduce/frames/' + taskId,
    method: 'get'
  })
}

// 单帧洗图
export function washImage(frameId, params) {
  return request({
    url: '/business/videoReproduce/washImage/' + frameId,
    method: 'post',
    params: { washMode: params.washMode, customPrompt: params.customPrompt, execMode: params.execMode || 'api' },
    data: params.refImages
  })
}

// 一键全部洗图
export function washAllImages(taskId, params) {
  return request({
    url: '/business/videoReproduce/washAllImages/' + taskId,
    method: 'post',
    params: { washMode: params.washMode, customPrompt: params.customPrompt, execMode: params.execMode || 'api' },
    data: params.refImages
  })
}

// 撤回洗图
export function undoWash(frameId) {
  return request({
    url: '/business/videoReproduce/undoWash/' + frameId,
    method: 'post'
  })
}

// 单帧生成视频
export function generateVideo(frameId, execMode = 'api') {
  return request({
    url: '/business/videoReproduce/generateVideo/' + frameId,
    method: 'post',
    params: { execMode }
  })
}

// 撤回视频
export function undoVideo(frameId) {
  return request({
    url: '/business/videoReproduce/undoVideo/' + frameId,
    method: 'post'
  })
}

// 删除复刻任务
export function delVideoReproduce(taskId) {
  return request({
    url: '/business/videoReproduce/' + taskId,
    method: 'delete'
  })
}

// 剪辑视频
export function clipVideo(frameId, removeRanges) {
  return request({
    url: '/business/videoReproduce/clipVideo/' + frameId,
    method: 'post',
    data: removeRanges
  })
}

// 合成全片视频
export function mergeVideos(taskId) {
  return request({
    url: '/business/videoReproduce/mergeVideos/' + taskId,
    method: 'post'
  })
}// 为单帧绑定音频
export function bindAudio(frameId, audioFile) {
  const formData = new FormData()
  formData.append('audio', audioFile)
  return request({
    url: '/business/videoReproduce/bindAudio/' + frameId,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 自动裁剪音频
export function autoTrimAudio(frameId) {
  return request({
    url: '/business/videoReproduce/autoTrimAudio/' + frameId,
    method: 'post'
  })
}

// 手动裁剪音频
export function manualTrimAudio(frameId, start, end) {
  return request({
    url: '/business/videoReproduce/manualTrimAudio/' + frameId,
    method: 'post',
    params: { start, end }
  })
}

// 将音频同步到视频
export function syncAudioToVideo(frameId) {
  return request({
    url: '/business/videoReproduce/syncAudioToVideo/' + frameId,
    method: 'post'
  })
}

// 更新单帧提示词
export function updatePrompts(frameId, promptEn, promptZh) {
  return request({
    url: '/business/videoReproduce/updatePrompts/' + frameId,
    method: 'post',
    data: { promptEn, promptZh }
  })
}

// 手动重新截帧
export function recaptureFrame(frameId, timestamp) {
  return request({
    url: '/business/videoReproduce/recaptureFrame/' + frameId,
    method: 'post',
    params: { timestamp }
  })
}

// 手动上传生成的视频
export function uploadGeneratedVideo(frameId, videoFile) {
  const formData = new FormData()
  formData.append('video', videoFile)
  return request({
    url: '/business/videoReproduce/uploadGeneratedVideo/' + frameId,
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 下载生成视频的音频
export function downloadAudio(frameId) {
  return request({
    url: '/business/videoReproduce/downloadAudio/' + frameId,
    method: 'get',
    responseType: 'blob'
  })
}
