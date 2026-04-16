import request from '@/utils/request'

// 查询素材库列表
export function listMaterial(query) {
  return request({
    url: '/business/material/list',
    method: 'get',
    params: query
  })
}

// 查询素材库详细
export function getMaterial(materialId) {
  return request({
    url: '/business/material/' + materialId,
    method: 'get'
  })
}

// 新增素材库
export function addMaterial(data) {
  return request({
    url: '/business/material',
    method: 'post',
    data: data
  })
}

// 修改素材库
export function updateMaterial(data) {
  return request({
    url: '/business/material',
    method: 'put',
    data: data
  })
}

// 删除素材库
export function delMaterial(materialId) {
  return request({
    url: '/business/material/' + materialId,
    method: 'delete'
  })
}
