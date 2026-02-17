export interface PromptCommentCompleteVO {
  /**
   * 已评论编号
   */
  commentCompleteId: string | number;

  /**
   * 评论编号
   */
  commentId: string | number;

  /**
   * 自媒体账号编号
   */
  mediaAccountId: string | number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 小红书笔记信息
   */
  xhsNoteInfo: string;

  /**
   * 检查状态（0未检查 1已检查）
   */
  checkStatus: number;

  /**
   * 评论状态（0正常 1吞评）
   */
  commentStatus: number;

  /**
   * 创建时间
   */
  createTime: string;

}

export interface PromptCommentCompleteForm extends BaseEntity {
  /**
   * 已评论编号
   */
  commentCompleteId?: string | number;

  /**
   * 评论编号
   */
  commentId?: string | number;

  /**
   * 自媒体账号编号
   */
  mediaAccountId?: string | number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 小红书笔记信息
   */
  xhsNoteInfo?: string;

  /**
   * 检查状态（0未检查 1已检查）
   */
  checkStatus?: number;

  /**
   * 评论状态（0正常 1吞评）
   */
  commentStatus?: number;

}

export interface PromptCommentCompleteQuery extends PageQuery {

  /**
   * 评论编号
   */
  commentId?: string | number;

  /**
   * 自媒体账号编号
   */
  mediaAccountId?: string | number;

  /**
   * 小红书笔记信息
   */
  xhsNoteInfo?: string;

  /**
   * 检查状态（0未检查 1已检查）
   */
  checkStatus?: number | string;

  /**
   * 评论状态（0正常 1吞评）
   */
  commentStatus?: number | string;

  /**
   * 日期范围参数
   */
  params?: any;
}
