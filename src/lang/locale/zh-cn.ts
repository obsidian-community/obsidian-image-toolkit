// 简体中文

export default {

  VIEW_MODE_NAME: '选择查看模式',
  VIEW_MODE_NORMAL: '🖼 普通',
  VIEW_MODE_PIN: '📌 贴图',

  // >>> 预览触发配置：
  VIEW_TRIGGER_SETTINGS: '预览触发配置',
  VIEW_IMAGE_GLOBAL_NAME: '支持全局预览图片',
  VIEW_IMAGE_GLOBAL_DESC: '开启后，在任何地方点击图片都可以弹出预览界面，可对图片进行缩放、旋转、拖动、和反色等。',
  VIEW_IMAGE_IN_EDITOR_NAME: '支持在编辑区域预览图片',
  VIEW_IMAGE_IN_EDITOR_DESC: '开启后，支持在编辑区域，点击图片预览。',
  // CPB = COMMUNITY_PLUGINS_BROWSER
  VIEW_IMAGE_IN_CPB_NAME: '支持在社区插件页面预览图片',
  VIEW_IMAGE_IN_CPB_DESC: '开启后，支持在社区插件页面，点击图片预览。',
  VIEW_IMAGE_WITH_A_LINK_NAME: '支持预览带链接的图片',
  VIEW_IMAGE_WITH_A_LINK_DESC: '开启后，支持点击带链接的图片（注意：点击该图片，会同时打开浏览器访问指定地址和弹出预览图片）',
  VIEW_IMAGE_OTHER_NAME: '支持除上述其他地方来预览图片',
  VIEW_IMAGE_OTHER_DESC: '除上述支持范围外，还支持一些其他区域，如Modal用户界面组件。',

  // >>> PIN_MODE_SETTINGS
  PIN_MODE_SETTINGS: "贴图模式设置",
  PIN_MODE_NAME: "📌 将所点击的图片贴到屏幕上",
  PIN_MODE_DESC: "你可以将当前所点击的图片贴到屏幕上，并且可以通过右击图片选择更多操作（按 Esc 关闭已贴图片的展示）",
  PIN_MAXIMUM_NAME: "最大贴图数量",
  PIN_COVER_NAME: "覆盖模式",
  PIN_COVER_DESC: "当贴图数量达到最大值后，此时再次点击图片，该图片会覆盖最早弹出的那个贴图。",
  PIN_MAXIMUM_NOTICE: "超过最大Pin图设置（非覆盖模式）",

  // >>>查看细节设置：
  VIEW_DETAILS_SETTINGS: '查看细节设置',
  IMAGE_MOVE_SPEED_NAME: '图片移动速度设置',
  IMAGE_MOVE_SPEED_DESC: '当使用键盘（上、下、左、右）移动图片时，可对图片移动速度进行设置。',
  IMAGE_TIP_TOGGLE_NAME: "展示缩放比例提示",
  IMAGE_TIP_TOGGLE_DESC: "开启后，当你缩放图片时会展示当前缩放的比例。",
  IMG_FULL_SCREEN_MODE_NAME: '全屏预览模式',
  // 全屏预览模式 下拉：
  FIT: '自适应',
  FILL: '填充',
  STRETCH: '拉伸',
  IMG_VIEW_BACKGROUND_COLOR_NAME: "设置预览图片的背景色（仅对透明背景的图片生效）",

  // >>>图片边框设置：
  IMAGE_BORDER_SETTINGS: '图片边框设置',
  IMAGE_BORDER_TOGGLE_NAME: "展示被点击图片的边框",
  IMAGE_BORDER_TOGGLE_DESC: "当离开图片预览和关闭弹出层后，突出展示被点击图片的边框。",
  IMAGE_BORDER_WIDTH_NAME: "设置图片边框宽度",
  IMAGE_BORDER_STYLE_NAME: "设置图片边框样式",
  IMAGE_BORDER_COLOR_NAME: "设置图片边框颜色",

  // IMG_BORDER_WIDTH 下拉：
  THIN: '较细',
  MEDIUM: '正常',
  THICK: '较粗',

  // IMG_BORDER_STYLE  下拉：
  //HIDDEN: '隐藏',
  DOTTED: '点状',
  DASHED: '虚线',
  SOLID: '实线',
  DOUBLE: '双线',
  GROOVE: '凹槽',
  RIDGE: ' 垄状',
  INSET: '凹边',
  OUTSET: '凸边',

  // IMAGE_BORDER_COLOR_NAME  下拉：
  BLACK: '黑色',
  BLUE: '蓝色',
  DARK_GREEN: '深绿色',
  GREEN: '绿色',
  LIME: '淡黄绿色',
  STEEL_BLUE: '钢青色',
  INDIGO: '靛蓝色',
  PURPLE: '紫色',
  GRAY: '灰色',
  DARK_RED: '深红色',
  LIGHT_GREEN: '浅绿色',
  BROWN: '棕色',
  LIGHT_BLUE: '浅蓝色',
  SILVER: '银色',
  RED: '红色',
  PINK: '粉红色',
  ORANGE: '橘黄色',
  GOLD: '金色',
  YELLOW: '黄色',

  // >>>Gallery Navbar Settings:
  GALLERY_NAVBAR_SETTINGS: '图片导航设置 (体验版)',
  GALLERY_NAVBAR_TOGGLE_NAME: "展示图片导航",
  GALLERY_NAVBAR_TOGGLE_DESC: "当前文档的所有图片会展示在弹出层的底部，可随意切换展示不同图片。",
  GALLERY_NAVBAR_DEFAULT_COLOR_NAME: "设置图片导航底栏背景色（默认展示）",
  GALLERY_NAVBAR_HOVER_COLOR_NAME: "设置图片导航底栏背景色（鼠标悬浮时）",
  GALLERY_IMG_BORDER_TOGGLE_NAME: "展示图片导航上被选中的图片",
  GALLERY_IMG_BORDER_TOGGLE_DESC: "当你选中正查看某一图片，对应图片导航底栏上将突出显示该缩略图片的边框。",
  GALLERY_IMG_BORDER_ACTIVE_COLOR_NAME: '设置被选中图片的边框色',

  // >>>HOTKEYS_SETTINGS:
  HOTKEY_SETTINGS: "快捷键设置",
  HOTKEY_SETTINGS_DESC: "📢  你无法为'移动图片'和'切换图片'设置相同的快捷键。（不支持贴图模式）",
  MOVE_THE_IMAGE_NAME: "为移动图片设置快捷键",
  MOVE_THE_IMAGE_DESC: "你可以利用快捷键来移动弹出层上的图片。",
  SWITCH_THE_IMAGE_NAME: "为切换图片设置快捷键",
  SWITCH_THE_IMAGE_DESC: "你可以利用快捷键来切换在图片导航栏上的图片至上一张/下一张。(注意: 仅当开启“展示图片导航”后，才能使用该快捷键来控制切换图片。)",
  DOUBLE_CLICK_TOOLBAR_NAME: "双击",
  VIEW_TRIGGER_HOTKEY_NAME: "为触发弹出查看图片设置快捷键",
  VIEW_TRIGGER_HOTKEY_DESC: "当你设置为“无”，你可以直接点击预览图片；否则，须按住已配置的修改键（Ctrl、Alt、Shift）才能点击查看某个图片。",

  // MODIFIER_HOTKEYS
  NONE: "无",

  // toolbar icon title
  ZOOM_TO_100: "缩放至100%",
  ZOOM_IN: "放大",
  ZOOM_OUT: "缩小",
  FULL_SCREEN: "全屏",
  REFRESH: "刷新",
  ROTATE_LEFT: "左旋",
  ROTATE_RIGHT: "右旋",
  SCALE_X: 'x轴翻转',
  SCALE_Y: 'y轴翻转',
  INVERT_COLOR: '反色',
  COPY: '复制',
  CLOSE: '关闭',

  // tip:
  COPY_IMAGE_SUCCESS: '拷贝图片成功！',
  COPY_IMAGE_ERROR: '拷贝图片失败！'

};
