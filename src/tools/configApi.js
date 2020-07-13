import logger from "../tools/logger";

class configApi {

    constructor() {
        this.video_close_action = 1; //1:询问, 2:只关闭视频窗口, 3:关闭视频窗口并结束推流
        this.video_pull_close_action = 0; //0:同video_close_action, 1:询问, 2:只关闭视频窗口, 3:关闭视频窗口并结束推流
        this.video_push_close_action = 0; //0:同video_close_action, 1:询问, 2:只关闭视频窗口, 3:关闭视频窗口并结束推流
    }

    set_video_close_action = (action) => {
        if (!action || (action != 1 && action != 2 && action != 3)) {
            logger.warn("set_video_close_action action invalid:{}", action);
            return false;
        }
        this.video_close_action = parseInt(action);
        logger.debug("set_video_close_action action:{}", this.video_close_action);
        return true;
    }

    get_video_close_action = () => {
        return this.video_close_action;
    }

    set_video_pull_close_action = (action) => {
        if (!action) {
            action = 0;
        } else if (action != 1 && action != 2 && action != 3) {
            logger.warn("set_video_pull_close_action action invalid:{}", action);
            return false;
        }
        this.video_push_close_action = parseInt(action);
        logger.debug("set_video_pull_close_action action:{}", this.video_push_close_action);
        return true;
    }

    get_video_pull_close_action = () => {
        return this.video_pull_close_action;
    }

    set_video_push_close_action = (action) => {
        if (!action) {
            action = 0;
        } else if (action != 1 && action != 2 && action != 3) {
            logger.warn("set_video_push_close_action action invalid:{}", action);
            return false;
        }
        this.video_push_close_action = parseInt(action);
        logger.debug("set_video_push_close_action action:{}", this.video_push_close_action);
        return true;
    }

    get_video_push_close_action = () => {
        return this.video_push_close_action;
    }

}

export default configApi;