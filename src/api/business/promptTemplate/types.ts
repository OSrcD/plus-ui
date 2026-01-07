export interface PromptTemplateVO {
  /**
   * 提示词ID
   */
  promptId: string | number;

  /**
   * 提示词模板
   */
  template: string;

  /**
   * 提示词分类（0棋牌 1对象）
   */
  templateType: number;

  /**
   * 状态（0停用 1启用 2封禁）
   */
  status: number;

  /**
   * 备注
   */
  remark: string;

}

export interface PromptTemplateForm extends BaseEntity {
  /**
   * 提示词ID
   */
  promptId?: string | number;

  /**
   * 提示词模板
   */
  template?: string;

  /**
   * 提示词分类（0棋牌 1对象）
   */
  templateType?: number;

  /**
   * 状态（0停用 1启用 2封禁）
   */
  status?: number;

  /**
   * 备注
   */
  remark?: string;

}

export interface PromptTemplateQuery extends PageQuery {

  /**
   * 提示词模板
   */
  template?: string;

  /**
   * 提示词分类（0棋牌 1对象）
   */
  templateType?: number;

  /**
   * 状态（0停用 1启用 2封禁）
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
