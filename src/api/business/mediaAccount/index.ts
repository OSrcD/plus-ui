import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MediaAccountVO, MediaAccountForm, MediaAccountQuery } from '@/api/business/mediaAccount/types';

/**
 * 查询自媒体账号列表
 * @param query
 * @returns {*}
 */

export const listMediaAccount = (query?: MediaAccountQuery): AxiosPromise<MediaAccountVO[]> => {
  return request({
    url: '/business/mediaAccount/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询自媒体账号详细
 * @param id
 */
export const getMediaAccount = (id: string | number): AxiosPromise<MediaAccountVO> => {
  return request({
    url: '/business/mediaAccount/' + id,
    method: 'get'
  });
};

/**
 * 新增自媒体账号
 * @param data
 */
export const addMediaAccount = (data: MediaAccountForm) => {
  return request({
    url: '/business/mediaAccount',
    method: 'post',
    data: data
  });
};

/**
 * 修改自媒体账号
 * @param data
 */
export const updateMediaAccount = (data: MediaAccountForm) => {
  return request({
    url: '/business/mediaAccount',
    method: 'put',
    data: data
  });
};

/**
 * 删除自媒体账号
 * @param id
 */
export const delMediaAccount = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/mediaAccount/' + id,
    method: 'delete'
  });
};
