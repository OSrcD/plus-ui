export interface PromptCommentVO {
  /**
   * 提示词评论ID
   */
  commentId: string | number;

  /**
   * 提示词模板ID
   */
  promptId: string | number;

  /**
   * 操作分组ID
   */
  operateGroupId: string | number;

  /**
   * 标题
   */
  title: string;

  /**
   * 提示词评论内容
   */
  commentContent: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 创建时间
   */
  createTime: string;

}

export interface PromptCommentForm extends BaseEntity {
  /**
   * 提示词评论ID
   */
  commentId?: string | number;

  /**
   * 提示词模板ID
   */
  promptId?: string | number;

  /**
   * 操作分组ID
   */
  operateGroupId?: string | number;

  /**
   * 标题
   */
  title?: string;

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
   * 提示词模板ID
   */
  promptId?: string | number;

  /**
   * 操作分组ID
   */
  operateGroupId?: string | number;

  /**
   * 标题
   */
  title?: string;

  /**
   * 提示词评论内容
   */
  commentContent?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
