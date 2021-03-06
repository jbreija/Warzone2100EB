include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include ("script/campaign/ultScav.js");

const ALPHA = 1; //Team alpha units belong to player 1.

var edgeMapIndex;
var alphaUnitIDs;
var startExtraLoss;

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("vtolRemoveZone", NEXUS);
});

//This is an area just below the "doorway" into the alpha team pit. Activates
//groups that are hidden farther south.
camAreaEvent("rescueTrigger", function(droid)
{
	hackRemoveMessage("C3-2_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	camManageGroup(camMakeGroup("laserTankGroup"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
		morale: 90,
		fallback: camMakePos("healthRetreatPos")
	});
	//Activate edge map queue and donate all of alpha to the player.
	phantomFactorySE();
	setAlliance(ALPHA, NEXUS, false);
	camAbsorbPlayer(ALPHA, CAM_HUMAN_PLAYER);
	queue("getAlphaUnitIDs", camSecondsToMilliseconds(2));
	camPlayVideos("MB3_2_MSG4");
});

//Play videos, donate alpha to the player and setup reinforcements.
camAreaEvent("phantomFacTrigger", function(droid)
{
	vtolAttack();
	camPlayVideos(["pcv456.ogg", "MB3_2_MSG3"]); //Warn about VTOLs.
	queue("enableReinforcements", camSecondsToMilliseconds(5));
});

function setAlphaExp()
{
	const DROID_EXP = 512; //Hero rank.
	var alphaDroids = enumArea("alphaPit", ALPHA, false).filter(function(obj) {
		return obj.type === DROID;
	});

	for (var i = 0, l = alphaDroids.length; i < l; ++i)
	{
		var dr = alphaDroids[i];
		if (!camIsSystemDroid(dr))
		{
			setDroidExperience(dr, DROID_EXP);
		}
	}
}

//Get the IDs of Alpha units after they were donated to the player.
function getAlphaUnitIDs()
{
	alphaUnitIDs = [];
	var alphaDroids = enumArea("alphaPit", CAM_HUMAN_PLAYER, false).filter(function(obj) {
		return obj.type === DROID && obj.experience === 512;
	});

	for (var i = 0, l = alphaDroids.length; i < l; ++i)
	{
		var dr = alphaDroids[i];
		alphaUnitIDs.push(dr.id);
	}
	startExtraLoss = true;
}

function phantomFactoryNE()
{
	var list = [cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas];
	sendEdgeMapDroids(6, "NE-PhantomFactory", list);
	queue("phantomFactoryNE", camChangeOnDiff(camMinutesToMilliseconds(2)));
}

function phantomFactorySW()
{
	var list = [cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas];
	sendEdgeMapDroids(8, "SW-PhantomFactory", list);
	queue("phantomFactorySW", camChangeOnDiff(camMinutesToMilliseconds(3)));
}

function phantomFactorySE()
{
	var list = [cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas, cTempl.nxlflash, cTempl.nxmrailh, cTempl.nxmlinkh];
	sendEdgeMapDroids(10 + camRand(6), "SE-PhantomFactory", list); //10-15 units
	queue("phantomFactorySE", camChangeOnDiff(camMinutesToMilliseconds(4)));
}

function sendEdgeMapDroids(droidCount, location, list)
{
	var droids = [];
	for (var i = 0; i < droidCount; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	camSendReinforcement(NEXUS, camMakePos(location), droids, CAM_REINFORCE_GROUND, {
		data: {regroup: true, count: -1}
	});
}

function setupPatrolGroups()
{
	camManageGroup(camMakeGroup("cyborgGroup1"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
		morale: 90,
		fallback: camMakePos("healthRetreatPos")
	});

	camManageGroup(camMakeGroup("cyborgGroup2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("upperMiddlePos"),
			camMakePos("upperMiddleEastPos"),
			camMakePos("playerLZ"),
			camMakePos("upperMiddleWest"),
			camMakePos("upperMiddleHill"),
		],
		interval: camSecondsToMilliseconds(20),
		regroup: true,
		count: -1
	});

	camManageGroup(camMakeGroup("cyborgGroup3"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("upperMiddleWest"),
			camMakePos("upperMiddleHill"),
			camMakePos("lowerMiddleEast"),
			camMakePos("lowerMiddleHill"),
		],
		interval: camSecondsToMilliseconds(20),
		regroup: true,
		count: -1
	});

	camManageGroup(camMakeGroup("cyborgGroup4"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("lowerMiddleEast"),
			camMakePos("lowerMiddleHill"),
			camMakePos("lowerMiddleWest"),
			camMakePos("SWCorner"),
			camMakePos("alphaDoorway"),
		],
		interval: camSecondsToMilliseconds(25),
		regroup: true,
		count: -1
	});

	camManageGroup(camMakeGroup("cyborgGroup5"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("upperMiddlePos"),
			camMakePos("upperMiddleEastPos"),
			camMakePos("playerLZ"),
			camMakePos("upperMiddleWest"),
			camMakePos("upperMiddleHill"),
			camMakePos("lowerMiddleEast"),
			camMakePos("lowerMiddleHill"),
			camMakePos("lowerMiddleWest"),
			camMakePos("SWCorner"),
			camMakePos("alphaDoorway"),
			camMakePos("NE-PhantomFactory"),
			camMakePos("SW-PhantomFactory"),
			camMakePos("SE-PhantomFactory"),
		],
		interval: camSecondsToMilliseconds(35),
		regroup: true,
		count: -1
	});
}

//Setup Nexus VTOL hit and runners.
function vtolAttack()
{
	var list = [cTempl.nxlscouv, cTempl.nxmtherv];
	var ext = {
		limit: [2, 4], //paired with template list
		alternate: true,
		altIdx: 0
	};
	camSetVtolData(NEXUS, "vtolAppearPos", "vtolRemovePos", list, camChangeOnDiff(camMinutesToMilliseconds(2)), undefined, ext);
}

//Reinforcements not available until team Alpha brief about VTOLS.
function enableReinforcements()
{
	playSound("pcv440.ogg"); // Reinforcements are available.
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "CAM3A-B", {
		area: "RTLZ",
		message: "C32_LZ",
		reinforcements: camMinutesToSeconds(2),
		callback: "alphaTeamAlive",
		retlz: true
	});
}

function alphaTeamAlive()
{
	if (camDef(alphaUnitIDs) && startExtraLoss)
	{
		var alphaAlive = false;
		var alive = enumArea(0, 0, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter(function(obj) {
			return obj.type === DROID;
		});

		for (var i = 0, l = alive.length; i < l; ++i)
		{
			for (var x = 0, c = alphaUnitIDs.length; x < c; ++x)
			{
				if (alive[i].id === alphaUnitIDs[x])
				{
					alphaAlive = true;
					break;
				}
			}
		}

		if (alphaAlive === false)
		{
			return false;
		}

		if (alphaAlive === true && alive.length > 0)
		{
			return true;
		}
	}
}

function eventStartLevel()
{
	var startpos = getObject("startPosition");
	var lz = getObject("landingZone");
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");
	startExtraLoss = false;

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "CAM3A-B", {
		area: "RTLZ",
		message: "C32_LZ",
		reinforcements: -1,
		callback: "alphaTeamAlive",
		retlz: true
	});

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	setAlliance(ULTSCAV, NEXUS, true);

	var enemyLz = getObject("NXlandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, NEXUS);

	camCompleteRequiredResearch(CAM3_2_RES_NEXUS, NEXUS);
	camCompleteRequiredResearch(CAM3_2_RES_ALLY, ALPHA);
	setAlliance(ALPHA, NEXUS, true);
	setAlliance(ALPHA, ULTSCAV, true);
	setAlliance(ALPHA, CAM_HUMAN_PLAYER, true);
	changePlayerColour(ALPHA, 0);

	phantomFactoryNE();
	phantomFactorySW();

	hackAddMessage("C3-2_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	queue("setAlphaExp", camSecondsToMilliseconds(2));
	queue("setupPatrolGroups", camSecondsToMilliseconds(15));
	ultScav_eventStartLevel(
		-1, // vtols on/off. -1 = off
		55, // build defense every x seconds
		50, // build factories every x seconds
		45, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		30, // produce droids every x seconds
		65, // produce cyborgs every x seconds
		-1, // produce VTOLs every x seconds
		2, // min factories
		-1, // min vtol factories
		2, // min cyborg factories
		4, // min number of trucks
		2, // min number of sensor droids
		20, // min number of attack droids
		10, // min number of defend droids
		135, // ground attack every x seconds
		-1, // VTOL attack every x seconds
		4); // tech level
}
