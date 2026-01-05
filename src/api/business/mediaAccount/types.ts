export interface MediaAccountVO {
  /**
   * 自媒体账号ID
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
   * 平台（0小红书 1抖音 2快手 3闲鱼 4视频号 5B站 6其他）
   */
  accountPlatform: number;

  /**
   * 账号类型（0个人 1企业 2机构 3其他）
   */
  accountType: number;

  /**
   * 账号主页链接
   */
  accountUrl: string;

  /**
   * 手机号码
   */
  phoneNumber: string;

  /**
   * 粉丝数
   */
  followerCount: number;

  /**
   * 状态（0停用 1启用 2封禁）
   */
  status: number;

  /**
   * 账号描述
   */
  remark: string;

}

export interface MediaAccountForm extends BaseEntity {
  /**
   * 自媒体账号ID
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
   * 平台（0小红书 1抖音 2快手 3闲鱼 4视频号 5B站 6其他）
   */
  accountPlatform?: number;

  /**
   * 账号类型（0个人 1企业 2机构 3其他）
   */
  accountType?: number;

  /**
   * 账号主页链接
   */
  accountUrl?: string;

  /**
   * 手机号码
   */
  phoneNumber?: string;

  /**
   * 粉丝数
   */
  followerCount?: number;

  /**
   * 状态（0停用 1启用 2封禁）
   */
  status?: number;

  /**
   * 账号描述
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
   * 平台（0小红书 1抖音 2快手 3闲鱼 4视频号 5B站 6其他）
   */
  accountPlatform?: number;

  /**
   * 账号类型（0个人 1企业 2机构 3其他）
   */
  accountType?: number;

  /**
   * 账号主页链接
   */
  accountUrl?: string;

  /**
   * 手机号码
   */
  phoneNumber?: string;

  /**
   * 粉丝数
   */
  followerCount?: number;

  /**
   * 状态（0停用 1启用 2封禁）
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
