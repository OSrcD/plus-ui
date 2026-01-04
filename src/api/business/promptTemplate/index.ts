import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PromptTemplateVO, PromptTemplateForm, PromptTemplateQuery } from '@/api/business/promptTemplate/types';

/**
 * 查询提示词模板列表
 * @param query
 * @returns {*}
 */

export const listPromptTemplate = (query?: PromptTemplateQuery): AxiosPromise<PromptTemplateVO[]> => {
  return request({
    url: '/business/promptTemplate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询提示词模板详细
 * @param promptId
 */
export const getPromptTemplate = (promptId: string | number): AxiosPromise<PromptTemplateVO> => {
  return request({
    url: '/business/promptTemplate/' + promptId,
    method: 'get'
  });
};

/**
 * 新增提示词模板
 * @param data
 */
export const addPromptTemplate = (data: PromptTemplateForm) => {
  return request({
    url: '/business/promptTemplate',
    method: 'post',
    data: data
  });
};

/**
 * 修改提示词模板
 * @param data
 */
export const updatePromptTemplate = (data: PromptTemplateForm) => {
  return request({
    url: '/business/promptTemplate',
    method: 'put',
    data: data
  });
};

/**
 * 删除提示词模板
 * @param promptId
 */
export const delPromptTemplate = (promptId: string | number | Array<string | number>) => {
  return request({
    url: '/business/promptTemplate/' + promptId,
    method: 'delete'
  });
};
