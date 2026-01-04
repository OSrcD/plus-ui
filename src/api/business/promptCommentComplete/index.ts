import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PromptCommentCompleteVO, PromptCommentCompleteForm, PromptCommentCompleteQuery } from '@/api/business/promptCommentComplete/types';

/**
 * 查询已评论列表
 * @param query
 * @returns {*}
 */

export const listPromptCommentComplete = (query?: PromptCommentCompleteQuery): AxiosPromise<PromptCommentCompleteVO[]> => {
  return request({
    url: '/business/promptCommentComplete/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询已评论详细
 * @param commentCompleteId
 */
export const getPromptCommentComplete = (commentCompleteId: string | number): AxiosPromise<PromptCommentCompleteVO> => {
  return request({
    url: '/business/promptCommentComplete/' + commentCompleteId,
    method: 'get'
  });
};

/**
 * 新增已评论
 * @param data
 */
export const addPromptCommentComplete = (data: PromptCommentCompleteForm) => {
  return request({
    url: '/business/promptCommentComplete',
    method: 'post',
    data: data
  });
};

/**
 * 修改已评论
 * @param data
 */
export const updatePromptCommentComplete = (data: PromptCommentCompleteForm) => {
  return request({
    url: '/business/promptCommentComplete',
    method: 'put',
    data: data
  });
};

/**
 * 删除已评论
 * @param commentCompleteId
 */
export const delPromptCommentComplete = (commentCompleteId: string | number | Array<string | number>) => {
  return request({
    url: '/business/promptCommentComplete/' + commentCompleteId,
    method: 'delete'
  });
};
