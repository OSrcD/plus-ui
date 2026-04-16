import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BizScraperPost, BizScraperPostQuery } from './types';

/**
 * 查询素材采集列表
 * @param query
 */
export function listScraperPost(query: BizScraperPostQuery): AxiosPromise<BizScraperPost[]> {
  return request({
    url: '/business/scraper/list',
    method: 'get',
    params: query
  });
}

/**
 * 更新媒体链接（图片+视频）
 * @param data
 */
export function updateMedia(data: any): AxiosPromise<void> {
  return request({
    url: '/business/scraper/updateMedia',
    method: 'put',
    data: data
  });
}

/**
 * 更新复刻素材结果
 * @param data
 */
export function updateRestyle(data: any): AxiosPromise<void> {
  return request({
    url: '/business/scraper/updateRestyle',
    method: 'put',
    data: data
  });
}
