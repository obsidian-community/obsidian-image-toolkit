// English

export default {

  // >>>Common Settings:
  VIEW_MODE_NAME: 'Choose a mode to view images',
  VIEW_MODE_NORMAL: '🖼 Normal',
  VIEW_MODE_PIN: '📌 Pin',
  RESET: 'reset to default',

  // >>>View Trigger Settings:
  VIEW_TRIGGER_SETTINGS: 'View trigger',
  VIEW_IMAGE_GLOBAL_NAME: 'Click and view an image globally', // @Deprecated
  VIEW_IMAGE_GLOBAL_DESC: 'You can zoom, rotate, drag, and invert it on the popup layer when clicking an image.', // @Deprecated
  VIEW_IMAGE_IN_EDITOR_NAME: 'Click and view an image in the Editor Area',
  VIEW_IMAGE_IN_EDITOR_DESC: 'Turn on this option if you want to click and view an image in the Editor Area.',
  // CPB = COMMUNITY_PLUGINS_BROWSER
  VIEW_IMAGE_IN_CPB_NAME: 'Click and view an image in the Community Plugins browser',
  VIEW_IMAGE_IN_CPB_DESC: 'Turn on this option if you want to click and view an image in the Community Plugins browser.',
  VIEW_IMAGE_WITH_A_LINK_NAME: 'Click and view an image with a link',
  VIEW_IMAGE_WITH_A_LINK_DESC: 'Turn on this option if you want to click and view an image with a link. (NOTE: The browser will be opened for you to visit the link and the image will be popped up for being viewed at the same time when you click the image.)',
  VIEW_IMAGE_OTHER_NAME: 'Click and view in the other areas except the above',
  VIEW_IMAGE_OTHER_DESC: 'Except for the above mentioned, it also supports other areas, like some modal user interface components.',

  // >>> PIN_MODE_SETTINGS
  PIN_MODE_SETTINGS: "Pin mode",
  PIN_MODE_NAME: "📌 Pin an image",
  PIN_MODE_DESC: "You can pin an image onto the top of the screen. And have more options by right click. (press Esc to close the image where your mouse cursor is hovering)",
  PIN_MAXIMUM_NAME: "The maximum images you can pin",
  PIN_COVER_NAME: "Cover mode",
  PIN_COVER_DESC: "After those pinned images reach maximum, you can cover the earliest pinned image when you click an image once again.",
  PIN_MAXIMUM_NOTICE: "Exceeded maximum images you can pin (non cover mode)",

  // >>>View Detail Settings:
  VIEW_DETAILS_SETTINGS: 'View details',
  IMAGE_MOVE_SPEED_NAME: 'Set the moving speed of the image',
  IMAGE_MOVE_SPEED_DESC: 'When you move an image on the popup layer by keyboard (up, down, left, right), the moving speed of the image can be set here.',
  IMAGE_TIP_TOGGLE_NAME: "Display the image's zoom number",
  IMAGE_TIP_TOGGLE_DESC: "Turn on this option if you want to display the zoom number when you zoom the image.",
  IMG_FULL_SCREEN_MODE_NAME: 'Full-screen preview mode',
  // preview mode options:
  FIT: 'Fit',
  FILL: 'Fill',
  STRETCH: 'Stretch',
  IMG_VIEW_BACKGROUND_COLOR_NAME: "Background color of the previewed image (Only support the image with transparent background)",

  // >>>Image Border Settings:
  IMAGE_BORDER_SETTINGS: 'Image border',
  IMAGE_BORDER_TOGGLE_NAME: "Display the image's border",
  IMAGE_BORDER_TOGGLE_DESC: "The clicked image's border can be displayed after you exit previewing and close the popup layer.",
  IMAGE_BORDER_WIDTH_NAME: "Image border width",
  IMAGE_BORDER_STYLE_NAME: "Image border style",
  IMAGE_BORDER_COLOR_NAME: "Image border color",

  // IMG_BORDER_WIDTH options:
  THIN: 'thin',
  MEDIUM: 'medium',
  THICK: 'thick',

  // IMG_BORDER_STYLE options:
  //HIDDEN: 'hidden',
  DOTTED: 'dotted',
  DASHED: 'dashed',
  SOLID: 'solid',
  DOUBLE: 'double',
  GROOVE: 'groove',
  RIDGE: 'ridge',
  INSET: 'inset',
  OUTSET: 'outset',

  // IMAGE_BORDER_COLOR_NAME options:
  BLACK: 'black',
  BLUE: 'blue',
  DARK_GREEN: 'dark green',
  GREEN: 'green',
  LIME: 'lime',
  STEEL_BLUE: 'steel blue',
  INDIGO: 'indigo',
  PURPLE: 'purple',
  GRAY: 'gray',
  DARK_RED: 'dark red',
  LIGHT_GREEN: 'light green',
  BROWN: 'brown',
  LIGHT_BLUE: 'light blue',
  SILVER: 'silver',
  RED: 'red',
  PINK: 'pink',
  ORANGE: 'orange',
  GOLD: 'gold',
  YELLOW: 'yellow',

  // >>>Gallery Navbar Settings:
  GALLERY_NAVBAR_SETTINGS: 'Gallery navbar (experimental)',
  GALLERY_NAVBAR_TOGGLE_NAME: "Display gallery navbar",
  GALLERY_NAVBAR_TOGGLE_DESC: "All of the images in the current pane view can be displayed at the bottom of the popup layer.",
  GALLERY_NAVBAR_DEFAULT_COLOR_NAME: "Background color of the gallery navbar (default state)",
  GALLERY_NAVBAR_HOVER_COLOR_NAME: "Background color of the gallery navbar (hovering state)",
  GALLERY_IMG_BORDER_TOGGLE_NAME: "Display the selected image on the gallery navbar",
  GALLERY_IMG_BORDER_TOGGLE_DESC: "When you select an image, the image's border will be displayed, so you can know which image is currently active.",
  GALLERY_IMG_BORDER_ACTIVE_COLOR_NAME: 'Border color of the selected image',

  // >>>HOTKEYS_SETTINGS:
  HOTKEY_SETTINGS: "Hotkeys",
  HOTKEY_SETTINGS_DESC: "📢 You cannot set the same hotkey for 'Move the image' and 'Switch the image' at the same time. (NOT SUPPORT in Pin Mode)",
  MOVE_THE_IMAGE_NAME: "Hotkey for moving the image",
  MOVE_THE_IMAGE_DESC: "You can move the image on the popup layer by hotkey.",
  SWITCH_THE_IMAGE_NAME: "Hotkey for switching the image",
  SWITCH_THE_IMAGE_DESC: "You can switch to the previous/next image on the gallery navbar by hotkey. (NOTE: You need to turn on 'Display gallery navbar' first, if you wanna use this hotkey.)",
  DOUBLE_CLICK_TOOLBAR_NAME: "Double click",
  VIEW_TRIGGER_HOTKEY_NAME: "Hotkey for triggering viewing an image",
  VIEW_TRIGGER_HOTKEY_DESC: "When you set 'None', you can directly click and preview an image without holding any modifier keys; otherwise, you must hold the configured modifier keys to click and preview an image.",

  // MODIFIER_HOTKEYS
  NONE: "None",
  CTRL: "Ctrl",
  ALT: "Alt",
  SHIFT: "Shift",
  CTRL_ALT: "Ctrl+Alt",
  CTRL_SHIFT: "Ctrl+Shift",
  SHIFT_ALT: "Shift+Alt",
  CTRL_SHIFT_ALT: "Ctrl+Shift+Alt",

  // toolbar icon title
  ZOOM_TO_100: "zoom to 100%",
  ZOOM_IN: "zoom in",
  ZOOM_OUT: "zoom out",
  FULL_SCREEN: 'full screen',
  REFRESH: "refresh",
  ROTATE_LEFT: "rotate left",
  ROTATE_RIGHT: "rotate right",
  SCALE_X: 'flip along x-axis',
  SCALE_Y: 'flip along y-axis',
  INVERT_COLOR: 'invert color',
  COPY: 'copy',
  CLOSE: 'close',

  // tip:
  COPY_IMAGE_SUCCESS: 'Copy the image successfully!',
  COPY_IMAGE_ERROR: 'Fail to copy the image!'

};
