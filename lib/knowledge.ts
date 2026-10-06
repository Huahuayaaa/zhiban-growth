import {topics,stages,categories,curriculumSource} from './curriculum';
// Source: official standard, printed p.12 figure 1. These are teaching adaptations, not quotations.
const extra=[
 {name:'安全饮食制作',category:categories[0],group:'烹饪与营养',materials:'清洗好的蔬果、餐盘、记录纸；按年龄由成人提供适宜器具',safety:'低年级只做择菜洗菜等冷加工；涉及刀具、热源必须由成人指导，不食用不明或未熟食材。',steps:['洗手并检查食材','按年级选择冷加工或成人指导烹饪','整理摆放并检查卫生','清洁台面并记录营养搭配']},
 {name:'纸艺制作',category:categories[1],group:'传统工艺制作',materials:'纸张、折纸示意图、收纳袋',safety:'优先使用徒手折纸；剪刀由教师根据年龄指导使用，不将工具指向他人。',steps:['观察样品并选择纸材','按图示折叠基础形状','组合并检查作品','整理材料并交流改进']},
 {name:'模拟生产与质检',category:categories[1],group:'工业生产劳动',materials:'无尖角积木、纸质订单、质检记录表',safety:'仅开展课堂模拟，不接触真实工业机器、化学品或电气生产设备。',steps:['识读模拟订单并分工','按标准组装积木模型','检查质量并记录问题','改进流程并回收材料']},
 {name:'智能浇灌方案体验',category:categories[1],group:'新技术体验与应用',materials:'纸质传感器示意图、植物观察记录、虚拟控制界面',safety:'采用离线模拟或合规低压教学套件，禁止接触市电；不宣称本平台提供真实硬件控制。',steps:['观察植物需水情况','认识传感与控制原理','模拟设置浇水条件','比较结果并改进方案']},
 {name:'校园图书服务',category:categories[2],group:'现代服务业劳动',materials:'待整理图书、分类标签、借阅模拟记录表',safety:'避免搬运过重书箱，保护借阅者个人信息，遵守学校图书管理规则。',steps:['了解读者需求与服务规则','按类别整理图书','模拟借阅登记与引导','复查记录并总结服务体验']},
];
export const gradeRanges=[[1,2],[3,4],[5,6],[7,9]];
export const taskGroups=[
 ['清洁与卫生',categories[0],[0,1]],['整理与收纳',categories[0],[0,1,2,3]],['烹饪与营养',categories[0],[0,1,2,3]],['家用器具使用与维护',categories[0],[1,2,3]],
 ['农业生产劳动',categories[1],[0,1,2,3]],['传统工艺制作',categories[1],[0,1,2,3]],['工业生产劳动',categories[1],[2,3]],['新技术体验与应用',categories[1],[2,3]],['现代服务业劳动',categories[2],[1,2,3]],['公益劳动与志愿服务',categories[2],[1,2,3]],
].map(([name,category,indices])=>({name:String(name),category:String(category),stages:(indices as number[]).map(i=>stages[i])}));
export const resourceTopics=[...topics,...extra].map(t=>({...t,stages:taskGroups.find(g=>g.name===t.group)!.stages}));
export function curriculumContext(topic:string,stage:string,grade:number){
 const t=resourceTopics.find(t=>t.name===topic),index=stages.indexOf(stage),range=gradeRanges[index];
 if(!t||!range||!Number.isInteger(grade)||grade<range[0]||grade>range[1])return null;
 const integrated=t.group==='清洁与卫生'&&index>=2;
 if(!t.stages.includes(stage)&&!integrated)return null;
 return {...t,grade,stage,source:curriculumSource,sourcePage:12,integrated,
   basis:integrated?'5–9年级清洁与卫生可与其他任务群融合实施，并结合日常课外活动与家庭劳动开展。':'任务群与学段关联依据课标第12页图1；具体教学步骤为本平台的教学改编。',
   ageGuide:index===0?'简单徒手、识别与整理，教师示范陪同；不安排独立刀具、电器或热源操作。':index===1?'在指导下完成简单工具操作、观察记录与合作，不接触带电维护和危险工具。':index===2?'增加方案设计、比较改进与过程记录；危险器具和热源必须成人指导。':'增加劳动计划、合作分工、质量评估与改进；继续遵守校园及设备安全规范。'};
}
