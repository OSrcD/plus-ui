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
   * 小红书吞评次数
   */
  xhsInterceptCount: number;

  /**
   * 小红书非吞评次数
   */
  xhsNormalCount: number;

  /**
   * 小红书折叠次数
   */
  xhsFoldCount: number;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 更新时间
   */
  updateTime: string;

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

  /**
   * 小红书吞评次数
   */
  xhsInterceptCount?: number;

  /**
   * 小红书非吞评次数
   */
  xhsNormalCount?: number;

  /**
   * 小红书折叠次数
   */
  xhsFoldCount?: number;
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
   * 小红书吞评次数
   */
  xhsInterceptCount?: number;

  /**
   * 小红书非吞评次数
   */
  xhsNormalCount?: number;

  /**
   * 小红书折叠次数
   */
  xhsFoldCount?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
