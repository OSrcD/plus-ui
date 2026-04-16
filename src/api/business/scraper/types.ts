export interface BizScraperPostQuery extends PageQuery {
  platform?: string;
  keyword?: string;
}

export interface BizScraperPost {
  scraperId: number | string;
  platform: string;
  postId: string;
  title: string;
  content: string;
  images: string;
  videos: string;
  sourceUrl: string;
  restyleInfo: string;
  createTime: string;
}
