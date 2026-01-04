export interface PromptTemplateVO {
  /**
   * 提示词编号
   */
  promptId: string | number;

  /**
   * 提示词模板
   */
  template: string;

  /**
   * 提示词分类
   */
  templateType: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 更新时间
   */
  updateTime: string;

}

export interface PromptTemplateForm extends BaseEntity {
  /**
   * 提示词编号
   */
  promptId?: string | number;

  /**
   * 提示词模板
   */
  template?: string;

  /**
   * 提示词分类
   */
  templateType?: number;

  /**
   * 备注
   */
  remark?: string;

}

export interface PromptTemplateQuery extends PageQuery {

  /**
   * 提示词分类
   */
  templateType?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
