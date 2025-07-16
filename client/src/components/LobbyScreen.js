import { MovieClipComponent } from "../components/swf_components/MovieClip";
import { TextFieldComponent } from "../components/swf_components/TextField";
import { Wrapper } from "./swf_components/Wrapper";

export class LobbyScreen extends Wrapper {
    /**
     * @type {MovieClipComponent}
     */
    bgr;


    // --------- TOP LEFT ---------
    /**
     * @type {MovieClipComponent}
     */
    topLeft;
    /**
     * @type {MovieClipComponent}
     */
    buttonRanked;
    /**
     * @type {MovieClipComponent}
     */
    rankedIcon;
    /**
     * @type {MovieClipComponent}
     */
    trophyRankIcon;
    /**
     * @type {TextFieldComponent}
     */
    progressText;
    /**
     * @type {MovieClipComponent}
     */
    progressBar;


    // --------- TOP RIGHT ---------
    /**
     * @type {MovieClipComponent}
     */
    topRight;
    /**
     * @type {MovieClipComponent}
     */
    teamInfo;
    /**
     * @type {TextFieldComponent}
     */
    blingsField;
    /**
     * @type {TextFieldComponent}
     */
    coinsField;
    /**
     * @type {TextFieldComponent}
     */
    gemsField;


    // --------- BOTTOM LEFT ---------
    /**
     * 
     * @type {MovieClipComponent} 
     */
    bottomLeft;

    // --------- BOTTOM RIGHT ---------
    /**
     * 
     * @type {MovieClipComponent} 
     */
    bottomRight;
    /**
     * 
     * @type {MovieClipComponent} 
     */
    eventButton;
    /**
     * 
     * @type {MovieClipComponent} 
     */
    gamemodeInfo;

    // --------- LEFT ---------
    /**
     * 
     * @type {MovieClipComponent} 
     */
    left;

    // --------- CENTER ---------
    /**
     * 
     * @type {MovieClipComponent} 
     */
    center;
    /**
     * 
     * @type {MovieClipComponent} 
     */
    brawler;
    /**
     * 
     * @type {MovieClipComponent} 
     */
    brawlerTrophies;

    // --------- RIGHT ---------
    /**
     * 
     * @type {MovieClipComponent} 
     */
    right;
    /**
     * 
     * @type {MovieClipComponent} 
     */
    sideMenu;


    constructor(game) {
        super(game);
        this.swf = game.swfs.get("ui");
        this.bgr = game.swfs.get("background_darkgreek")

        if (this.swf) {
            this.setupBackground();
            this.setupLeft();
            this.setupCenter();
            this.setupRight();
            this.setupTop();
            this.setupTopLeft();
            this.setupTopRight();
            this.setupBottomLeft();
            this.setupBottomRight();

            this.addChild(this.bgr, this.top, this.left, this.center, this.topLeft, this.bottomRight, this.right, this.topRight, this.bottomLeft);

            this.game.stage.addChild(this);
        } else {
            throw new Error("There was an error while trying to show lobby screen");
        }
    }

    setupBackground() {
        this.bgr = this.bgr.renderMovieClipByName("bgr_darkgreek");

        this.bgr.apply = (b) => {
            b.x = window.innerWidth / 2
            b.y = window.innerHeight / 2
        }
    }

    setupLeft() {
        this.left = this.swf.renderMovieClipByName("mainscreen_hud_left");

        this.left.apply = (b) => {
            b.x = 0
            b.y = window.innerHeight / 2
        }
    }

    setupCenter() {
        this.center = this.swf.renderMovieClipByName("mainscreen_center");
        this.brawler = this.center.getMovieClipByName("player_1_area");
        this.brawlerTrophies = this.brawler.getMovieClipByName("trophy_bar");

        this.center.apply = (b) => {
            b.x = window.innerWidth / 2
            b.y = window.innerHeight / 2
        }

        this.center
            .hideChildByName("player_5_area")
            .hideChildByName("player_4_area")
            .hideChildByName("player_3_area")
            .hideChildByName("player_2_area")
            .hideChildByName("panel_player_online_ph_right")
            .hideChildByName("panel_player_online_ph_left")
            .hideChildByName("panel_player_online_ph_left_left")
            .hideChildByName("panel_player_online_right_right")
            .hideChildByName("button_brawler_quest")
            .hideChildByName("panel_own_invite_4")
            .hideChildByName("panel_other_invite_4")
            .hideChildByName("panel_own_invite_5")
            .hideChildByName("panel_other_invite_5")
            .hideChildByName("panel_own_invite_2")
            .hideChildByName("panel_other_invite_2")
            .hideChildByName("panel_own_invite_3")
            .hideChildByName("panel_other_invite_3")
            .hideEveryChildByName("panel_player_online");

        this.brawler
            .hideChildByName("area")
            .hideChildByName("player_name_txt")
            .hideChildByName("icon_roomleader")
            .hideChildByName("player_status")
            .hideChildByName("bubble")
            .hideChildByName("button_quick_chat")
            .hideChildByName("collab_item_lobby_button")
            .hideChildByName("overcharge")
            .hideChildByName("tickets")
            .hideChildByName("ranked_rank_icon")
            .hideChildByName("trophy_bar_season")

        this.updateBrawler();

    }

    setupRight() {
        this.right = this.swf.renderMovieClipByName("mainscreen_hud_right");
        this.sideMenu = this.right.getMovieClipByName("hamburger_menu");

        this.right.apply = (b) => {
            b.x = window.innerWidth
            b.y = window.innerHeight / 2
        }

        this.right
            .hideChildByName("button_cctv")

        this.sideMenu.setLooping(false, false);
        this.sideMenu.setCurrentFrame(0);
    }

    setupTop() {
        this.top = this.swf.renderMovieClipByName("mainscreen_hud_top");

        this.top.apply = (b) => {
            b.x = window.innerWidth / 2
            b.y = 0
        }
    }

    setupTopLeft() {
        this.topLeft = this.swf.renderMovieClipByName("mainscreen_hud_top_left");
        this.buttonRanked = this.topLeft.getMovieClipByName("button_competitive");
        this.rankedIcon = this.topLeft.getMovieClipByName("rank_icon");
        this.trophyRankIcon = this.topLeft.getMovieClipByName("rank_icon_new");
        this.progressText = this.topLeft.getTextFieldByName("progress_txt");
        this.progressBar = this.topLeft.getMovieClipByName("progress_bar");

        this.topLeft
            .hideChildByName("button_navi_login_calendar_1")
            .hideChildByName("button_navi_login_calendar_2")
            .hideChildByName("button_navi_login_calendar_3")
            .hideChildByName("button_navi_daily_streak")
            .hideChildByName("esports_tooltip")
            .hideChildByName("rank_icon", 1)
            .hideChildByName("icon_league_reward")
            .hideEveryChildByName("spacer");

        this.setRankedButtonType("default");
        this.setRankedIcon("bronze", "I");
        this.trophyRankIcon.setCurrentFrame(0, true);
        this.trophyRankIcon.parent.setCurrentFrame(14, true);
        this.setTrophiesProgress(69696);
    }

    setupTopRight() {
        this.topRight = this.swf.renderMovieClipByName("mainscreen_hud_top_right");
        this.teamInfo = this.topRight.getMovieClipByName("team_info");
        this.blingsField = this.topRight.getMovieClipByName("header_cosmetic_coins_resource").getTextFieldByName("value_txt");
        this.coinsField = this.topRight.getMovieClipByName("header_craft_resource").getTextFieldByName("value_txt");
        this.gemsField = this.topRight.getMovieClipByName("header_gem_resource").getTextFieldByName("value_txt");

        this.topRight.apply = (b) => b.x = window.innerWidth;

        this.topRight
            .hideChildByName("players_online_debug_txt", 0)
            .hideChildByName("header_legendary_trophy_resource")
            .hideChildByName("header_collab_resource")
            .hideChildByName("header_power_points_resource")
            .hideChildByName("exclamation")
            .hideChildByName("button_value_list")
            .hideChildByName("button_pending_donation")
            .hideChildByName("notification");

        this.teamInfo.setCurrentFrameByLabel("ani_in", true)

        this.blingsField.setAdjustFontSize(true).setCustomValue("40026");
        this.coinsField.setAdjustFontSize(true).setCustomValue("2399");
        this.gemsField.setAdjustFontSize(true).setCustomValue("498");
    }

    setupBottomLeft() {
        this.bottomLeft = this.swf.renderMovieClipByName("mainscreen_hud_bottom_left");
        this.brawlPassButton = this.bottomLeft.getMovieClipByName("button_brawl_pass");
        this.questsButton = this.bottomLeft.getMovieClipByName("button_quests");
        this.brawlPassTierText = this.brawlPassButton.getTextFieldByName("tier_number_txt");
        this.brawlPassTierAnim = this.brawlPassButton.getMovieClipByName("tier_node");
        this.brawlPassProgressBar = this.brawlPassButton.getMovieClipByName("progress_bar");
        this.brawlPassProgressText = this.brawlPassButton.getTextFieldByName("value_txt");


        this.bottomLeft.apply = (b) => b.y = window.innerHeight;

        this.bottomLeft
            .hideChildByName("bp_discount")
            .hideChildByName("brawl_pass_reward_icon");

        this.brawlPassButton.hideEveryChildByName("notification");
        this.questsButton.hideEveryChildByName("notification");

        this.brawlPassTierAnim.setLooping(false);
        this.brawlPassProgressBar.setCurrentFrame(0);

        this.setBrawlPassButtonType("inprogress");
        this.setBrawlPassTier(51);
        this.setBrawlPassProgress(530);
    }

    setupBottomRight() {
        this.bottomRight = this.swf.renderMovieClipByName("mainscreen_hud_bottom_right");
        this.eventButton = this.bottomRight.getMovieClipByName("button_mode");
        this.gamemodeInfo = this.eventButton.getMovieClipByName("info");

        this.bottomRight.apply = (b) => {
            b.x = window.innerWidth
            b.y = window.innerHeight;
        };

        this.bottomRight
            .hideChildByName("button_connection")
            .hideChildByName("button_play_club_league")
            .hideChildByName("raid_boss_container")
            .hideChildByName("locked_rank_warning_container")
            .hideChildByName("rank_team_warning_container")
            .hideChildByName("button_spectate")
            .hideChildByName("button_pro_league")
            .hideChildByName("button_championship_challenge")
            .hideChildByName("button_ranked")
            .hideChildByName("rank_mode_label")
            .hideChildByName("important_notice")
            .hideChildByName("ranked_diamond_format_tooltip")
            .hideChildByName("competitive_pass_points_button")
            .hideChildByName("vfx_overcharge")
            .hideChildByName("vfx_overcharge_front")
            .hideChildByName("recommended_brawlers_anim")
            .hideChildByName("button_winstreak")
            .hideChildByName("collab_play_reward_button")
            .hideChildByName("button_quest_icon")
            .hideChildByName("pro_league")
            .hideChildByName("halloween")
            .hideChildByName("icon_brawler")
            .hideChildByName("icon_modifire")

        this.bottomRight.getMovieClipByName("shower").setCurrentFrame(0);
        this.mapText("info_txt", "");
        this.mapText("cleared_txt", "");
        this.mapText("new_events_txt", "TID_MODES_NEW_EVENT");

        let starrdropRewards = [0, 3, 7];

        for (let i = 0; i < 8; i++) {
            const win = this.bottomRight.getMovieClipByName(`win_${i + 1}`);
            win.setCurrentFrameByLabel("current");
            win.hideChildByName("collab_reward");
            if (starrdropRewards.includes(i)) {
                win.hideChildByName("double")
            }
        }

        this.gamemodeInfo.setLooping(false, false);
        this.gamemodeInfo.setCurrentFrame(0, true);

        this.setEventButtonMode("idle");
        this.setGamemode(0);

    }

    /**
     * @param {"default" | "unlocked" | "new_season"} type 
     */
    setRankedButtonType(type) {
        this.buttonRanked.setCurrentFrameByLabel(type);
        return this;
    }

    setRankedIcon(type, tier = "I") {
        this.rankedIcon.setCurrentFrameByLabel(type);
        this.rankedIcon.getTextFieldByName(`rank_${type}_text`).setCustomValue(tier);
        return this;
    }

    setTrophiesProgress(value) {
        this.progressText.setCustomValue(value.toFixed(0));
        this.progressBar.setCurrentFrame(0);
        return this;
    }

    setTrophyRankIcon(index) {
        this.trophyRankIcon.setCurrentFrame(index);
        return this;
    }

    /**
     * @param {"inprogress" | "ready" | "new_season"} type 
     */
    setBrawlPassButtonType(type) {
        this.brawlPassButton.setCurrentFrameByLabel(`brawl_pass_${type}`);
        return this;
    }

    /**
     * Sets the tier number
     * @param {string} tier
     * @param {boolean} playAnimation Whether to play tier up animation 
     */
    setBrawlPassTier(tier, playAnimation = false) {
        this.brawlPassTierText.setCustomValue(tier);
        if (playAnimation) {

        }
        return this;
    }

    setBrawlPassProgress(progress) {
        this.brawlPassProgressBar.setCurrentFrame(Math.min(Math.floor(progress / 950 * 100), 99));
        this.brawlPassProgressText.setCustomValue(`${progress}/950`);
    }

    /**
     * @param {"idle" | "new_event" | "new_event_ticketed" | "suggest_event"} mode 
     */
    setEventButtonMode(mode) {
        this.eventButton.setCurrentFrameByLabel(mode);
    }

    setGamemode(number) {
        this.gamemodeInfo.replay();
    }

    updateBrawler() {
        this.brawlerTrophies.getChildByName("progress_bar").setCurrentFrame(99);
        this.brawlerTrophies;
    }
}