import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PromptCommentVO, PromptCommentForm, PromptCommentQuery } from '@/api/business/promptComment/types';

/**
 * 查询提示词评论列表
 * @param query
 * @returns {*}
 */

export const listPromptComment = (query?: PromptCommentQuery): AxiosPromise<PromptCommentVO[]> => {
  return request({
    url: '/business/promptComment/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询提示词评论详细
 * @param commentId
 */
export const getPromptComment = (commentId: string | number): AxiosPromise<PromptCommentVO> => {
  return request({
    url: '/business/promptComment/' + commentId,
    method: 'get'
  });
};

/**
 * 新增提示词评论
 * @param data
 */
export const addPromptComment = (data: PromptCommentForm) => {
  return request({
    url: '/business/promptComment',
    method: 'post',
    data: data
  });
};

/**
 * 修改提示词评论
 * @param data
 */
export const updatePromptComment = (data: PromptCommentForm) => {
  return request({
    url: '/business/promptComment',
    method: 'put',
    data: data
  });
};

/**
 * 删除提示词评论
 * @param commentId
 */
export const delPromptComment = (commentId: string | number | Array<string | number>) => {
  return request({
    url: '/business/promptComment/' + commentId,
    method: 'delete'
  });
};
