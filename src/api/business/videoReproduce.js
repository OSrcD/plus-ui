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
export function generateAllVideos(taskId) {
  return request({
    url: '/business/videoReproduce/generateAll/' + taskId,
    method: 'post'
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
    params: { washMode: params.washMode, customPrompt: params.customPrompt },
    data: params.refImages
  })
}

// 一键全部洗图
export function washAllImages(taskId, params) {
  return request({
    url: '/business/videoReproduce/washAllImages/' + taskId,
    method: 'post',
    params: { washMode: params.washMode, customPrompt: params.customPrompt },
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
export function generateVideo(frameId) {
  return request({
    url: '/business/videoReproduce/generateVideo/' + frameId,
    method: 'post'
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
