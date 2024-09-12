const $ = (selectors) => document.querySelector(selectors);

export const $app = $("#app");

// scenes
export const $loadScene = $("#ls");
export const $mainScene = $("#ms");

// canvas
export const $bgCanvas = $("#bgc");
export const $fgCanvas = $("#fgc");

// walllet connector
export const $walletConnector = $("#wc");
export const $walletAddress = $("#wca");
export const $returnBtn = $("#r-btn");

// token control
export const $tokenAmount = $("#tam span");
export const $tokenIncome = $("#ti span");
export const $tokenExpense = $("#te span");
export const $wdBtn = $("#wd-btn");
export const $dpBtn = $("#dp-btn");

// clock
export const $clockTime = $("#ct");
export const $clockCountdown = $("#cc");

export const $storeBtn = $("#st-btn");

// alert
export const $alertContainer = $("#ac");
export const $alertMsg = $("#amsg");

// loadScene
export const $loadingext = $("#ltxt");
export const $loadingMsg = $("#lmsg");

// modal
export const $modal = $("#md");
export const $modalContainer = $("#mdc");
export const $modalTitle = $("#mdt");
export const $modalSubtitle = $("#mds");
export const $modalBody = $("#mdb");

// deposit modal
export const $dpModal = $("#dp-md");
export const $dpInput = $("#dp-in");
export const $dpInputInfo = $("#dp-in-if");
export const $dpSendBtn = $("#send-dp-btn");

// withdraw modal
export const $wdModal = $("#wd-md");
export const $wdInput = $("#wd-in");
export const $wdInputInfo = $("#wd-in-if");
export const $wdSendBtn = $("#send-wd-btn");

// nft modal
export const $machinesModal = $("#m-md");
export const cards = [$("#m1"), $("#m2"), $("#m3")];
export const installs = [$("#m1 .i"), $("#m2 .i"), $("#m3 .i")];
export const uninstalls = [$("#m1 .ui"), $("#m2 .ui"), $("#m3 .ui")];
export const buys = [$("#m1 .b"), $("#m2 .b"), $("#m3 .b")];
export const sells = [$("#m1 .s"), $("#m2 .s"), $("#m3 .s")];

export const sellLabels = [
	$("#m1 .s span"),
	$("#m2 .s span"),
	$("#m3 .s span"),
];
