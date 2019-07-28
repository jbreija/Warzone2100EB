
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/ultScav.js");

const SCAVS = 7; //Scav player number

//Ambush player from scav base - triggered from middle path
camAreaEvent("scavBaseTrigger", function()
{
	var ambushGroup = camMakeGroup(enumArea("eastScavs", SCAVS, false));
	camManageGroup(ambushGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("artifactLocation")
	});
});

//Moves west scavs units closer to the base - triggered from right path
camAreaEvent("ambush1Trigger", function()
{
	var ambushGroup = camMakeGroup(enumArea("westScavs", SCAVS, false));
	camManageGroup(ambushGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("ambush1")
	});
});

//Sends some units towards player LZ - triggered from left path
camAreaEvent("ambush2Trigger", function()
{
	var ambushGroup = camMakeGroup(enumArea("northWestScavs", SCAVS, false));
	camManageGroup(ambushGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("ambush2")
	});
});

function eventPickup(feature, droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && feature.stattype === ARTIFACT)
	{
		hackRemoveMessage("C1-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	}
}

//Mission setup stuff
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "SUB_1_2S", {
		area: "RTLZ",
		message: "C1-1_LZ",
		reinforcements: -1, //No reinforcements
		retlz: true
	});

	var startpos = getObject("startPosition");
	var lz = getObject("landingZone"); //player lz
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	//Get rid of the already existing crate and replace with another
	camSafeRemoveObject("artifact1", false);
	camSetArtifacts({
		"artifactLocation": { tech: "R-Wpn-MG3Mk1" }, //Heavy machine gun
	});

	camPlayVideos("FLIGHT");
	hackAddMessage("C1-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, true);
	ultScav_eventStartLevel(
		1, // vtols on/off. -1 = off
		20, // build defense every x seconds
		35, // build factories every x seconds
		-1, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		25, // produce droids every x seconds
		-1, // produce cyborgs every x seconds
		35, // produce VTOLs every x seconds
		10, // min factories
		4, // min vtol factories
		-1, // min cyborg factories
		3, // min number of trucks
		2, // min number of sensor droids
		7, // min number of attack droids
		3, // min number of defend droids
		-1, // ground attack every x seconds
		-1, // VTOL attack every x seconds
		1); // tech level
}
