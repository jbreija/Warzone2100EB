include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include ("script/campaign/ultScav.js");

var allowWin;

//Remove enemy vtols when in the remove zone area.
function checkEnemyVtolArea()
{
	var pos = {"x": 127, "y": 64};
	var vtols = enumRange(pos.x, pos.y, 2, THE_COLLECTIVE, false).filter(function(obj) {
		return isVTOL(obj);
	});

	for (var i = 0, l = vtols.length; i < l; ++i)
	{
		if ((vtols[i].weapons[0].armed < 20) || (vtols[i].health < 60))
		{
			camSafeRemoveObject(vtols[i], false);
		}
	}

	queue("checkEnemyVtolArea", camSecondsToMilliseconds(1));
}

//Play last video sequence and destroy all droids on map.
function playLastVideo()
{
	var droids = enumArea(0, 0, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter(function(obj) {
		return (obj.type === DROID && !camIsTransporter(obj));
	});

	for (var i = 0, l = droids.length; i < l; ++i)
	{
		camSafeRemoveObject(droids[i], false);
	}
	camPlayVideos("CAM2_OUT");
}

//Allow a win if a transporter was launched.
function eventTransporterLaunch(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		allowWin = true;
	}
}

//Return randomly selected droid templates.
function randomTemplates(list, isTransport)
{
	var droids = [];
	var size = camDef(isTransport) ? 8 + camRand(3) : 18 + camRand(8);

	for (var i = 0; i < size; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	return droids;
}

//Attack every 30 seconds.
function vtolAttack()
{
	const VTOL_POSITIONS = [
		{"x": 99, "y": 1},
		{"x": 127, "y": 65},
		{"x": 127, "y": 28},
		{"x": 36, "y": 1},
		{"x": 1, "y": 28},
	];
	var vtolRemovePos = {"x": 127, "y": 64};

	var list = [cTempl.commorv, cTempl.colcbv, cTempl.colagv, cTempl.comhvat];
	camSetVtolData(THE_COLLECTIVE, VTOL_POSITIONS, vtolRemovePos, list, camChangeOnDiff(camSecondsToMilliseconds(30)));
}

//SouthEast attackers which are mostly cyborgs.
function cyborgAttack()
{
	var southCyborgAssembly = {"x": 123, "y": 125};
	var list = [cTempl.npcybr, cTempl.cocybag, cTempl.npcybc, cTempl.comhltat, cTempl.cohhpv];

	camSendReinforcement(THE_COLLECTIVE, camMakePos(southCyborgAssembly), randomTemplates(list), CAM_REINFORCE_GROUND, {
		data: { regroup: false, count: -1 }
	});

	queue("cyborgAttack", camChangeOnDiff(camMinutesToMilliseconds(4)));
}

//North road attacker consisting of powerful weaponry.
function tankAttack()
{
	var northTankAssembly = {"x": 95, "y": 3};
	//var westTankAssembly = {"x": 3, "y": 112}; //This was unused.

	var list = [cTempl.comhltat, cTempl.cohact, cTempl.cohhpv, cTempl.comagt, cTempl.cohbbt];
	var pos = [];
	pos.push(northTankAssembly);

	camSendReinforcement(THE_COLLECTIVE, camMakePos(northTankAssembly), randomTemplates(list), CAM_REINFORCE_GROUND, {
		data: { regroup: false, count: -1, },
	});
	queue("tankAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));
}

//NOTE: this is only called once from the library's eventMissionTimeout().
function checkIfLaunched()
{
	var transporters = enumArea(0, 0, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter(function(obj) {
		return (obj.type === DROID && camIsTransporter(obj));
	});
	if (transporters.length > 0)
	{
		allowWin = false;
	}

	if (allowWin)
	{
		camCallOnce("playLastVideo");
		return true;
	}
	return false;
}

//Everything in this level mostly just requeues itself until the mission ends.
function eventStartLevel()
{
	var startpos = {"x": 88, "y": 101};
	var lz = {"x": 86, "y": 99, "x2": 88, "y2": 101};
	var tCoords = {"xStart": 87, "yStart": 100, "xOut": 0, "yOut": 55};

	camSetStandardWinLossConditions(CAM_VICTORY_TIMEOUT, "CAM_3A", {
		reinforcements: camMinutesToSeconds(7), //Duration the transport "leaves" map.
		callback: "checkIfLaunched"
	});
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	camSetupTransporter(tCoords.xStart, tCoords.yStart, tCoords.xOut, tCoords.yOut);

	var enemyLz = {"x": 49, "y": 83, "x2": 51, "y2": 85};
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, THE_COLLECTIVE);
	setAlliance(THE_COLLECTIVE, ULTSCAV, true);
	
	setMissionTime(camMinutesToSeconds(30));
	camCompleteRequiredResearch(CAM2END_RES_COL, THE_COLLECTIVE);

	allowWin = false;
	camPlayVideos(["MB2_DII_MSG", "MB2_DII_MSG2"]);

	//These requeue themselves every so often.
	vtolAttack();
	cyborgAttack();
	tankAttack();
	checkEnemyVtolArea();
	ultScav_eventStartLevel(
		1, // vtols on/off. -1 = off
		20, // build defense every x seconds
		50, // build factories every x seconds
		45, // build cyborg factories every x seconds
		25, // produce trucks every x seconds
		35, // produce droids every x seconds
		25, // produce cyborgs every x seconds
		40, // produce VTOLs every x seconds
		5, // min factories
		5, // min vtol factories
		5, // min cyborg factories
		10, // min number of trucks
		3, // min number of sensor droids
		10, // min number of attack droids
		3, // min number of defend droids
		135, // ground attack every x seconds
		135, // VTOL attack every x seconds
		2.5); // tech level
}
