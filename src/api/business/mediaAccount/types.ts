export interface MediaAccountVO {
  /**
   * 账号编号
   */
  id: string | number;

  /**
   * 账号ID
   */
  accountId: string | number;

  /**
   * 账号名称
   */
  accountName: string;

  /**
   * 平台
   */
  accountPlatform: number;

  /**
   * 账号类型
   */
  accountType: number;

  /**
   * 账号主页链接
   */
  accountUrl: string;

  /**
   * 粉丝数
   */
  followerCount: number;

  /**
   * 状态
   */
  status: number;

  /**
   * 描述
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

export interface MediaAccountForm extends BaseEntity {
  /**
   * 账号编号
   */
  id?: string | number;

  /**
   * 账号ID
   */
  accountId?: string | number;

  /**
   * 账号名称
   */
  accountName?: string;

  /**
   * 平台
   */
  accountPlatform?: number;

  /**
   * 账号类型
   */
  accountType?: number;

  /**
   * 账号主页链接
   */
  accountUrl?: string;

  /**
   * 粉丝数
   */
  followerCount?: number;

  /**
   * 状态
   */
  status?: number;

  /**
   * 描述
   */
  remark?: string;

}

export interface MediaAccountQuery extends PageQuery {

  /**
   * 账号ID
   */
  accountId?: string | number;

  /**
   * 账号名称
   */
  accountName?: string;

  /**
   * 平台
   */
  accountPlatform?: number;

  /**
   * 账号类型
   */
  accountType?: number;

  /**
   * 状态
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
