export interface PromptCommentVO {
  /**
   * 提示词评论编号
   */
  commentId: string | number;

  /**
   * 提示词模板编号
   */
  promptId: string | number;

  /**
   * 提示词评论内容
   */
  commentContent: string;

  /**
   * 备注
   */
  remark: string;

}

export interface PromptCommentForm extends BaseEntity {
  /**
   * 提示词评论编号
   */
  commentId?: string | number;

  /**
   * 提示词模板编号
   */
  promptId?: string | number;

  /**
   * 提示词评论内容
   */
  commentContent?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface PromptCommentQuery extends PageQuery {

  /**
   * 提示词模板编号
   */
  promptId?: string | number;

  /**
   * 提示词评论内容
   */
  commentContent?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
