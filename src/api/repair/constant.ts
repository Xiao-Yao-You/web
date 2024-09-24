// 问题类型
export enum IssueTypeEnum {
  Software = '0',
  Hardware = '1',
  Other = '2'
}

export const IssueTypeOptions = [
  { label: '软件', value: IssueTypeEnum.Software },
  { label: '硬件', value: IssueTypeEnum.Hardware },
  { label: '其他', value: IssueTypeEnum.Other }
]
