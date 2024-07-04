// 启用枚举
export enum EnableEnums {
  enable = 0,
  disable = 1
}

// 单据编码-中缀
export const infixOptions = [
  { label: '无', value: 'none' },
  { label: 'yyMM', value: 'yyMM' },
  { label: 'MMdd', value: 'MMdd' },
  { label: 'yyMMdd', value: 'yyMMdd' },
  { label: 'yyyyMMdd', value: 'yyyyMMdd' }
]

// 单据编码-后缀（位数）
export const suffixOptions = [
  { label: '000', value: '000' },
  { label: '0000', value: '0000' },
  { label: '00000', value: '00000' }
]

// 单据编码-规则枚举
export enum SceneTypeEnums {
  '00' = '每日重置',
  '01' = '每周重置',
  '02' = '每月重置',
  '03' = '每年重置',
  '04' = '不重置'
}

// 单据编码-规则
export const sceneType = [
  { label: '每日重置', value: '00' },
  { label: '每周重置', value: '01' },
  { label: '每月重置', value: '02' },
  { label: '每年重置', value: '03' },
  { label: '不重置', value: '04' }
]
