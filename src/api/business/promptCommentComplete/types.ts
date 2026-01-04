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
   * 日期范围参数
   */
  params?: any;
}
