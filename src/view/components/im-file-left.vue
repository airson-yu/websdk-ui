<template>
    <div class="im-text-left">
        <div class="avatar">
            <Avatar size="large" class="" :src="avatar"/>
        </div>
        <div class="im-content">
            <div class="item-top">
                <span>{{ts}}</span>
                <span>{{uname}}</span>
            </div>
            <div class="item-content">
                <div class="left-angle"></div>
                <div class="message msg_file_left">
                    <div class="im_file_name_div_left">
                        <div class="im_file_name_left"><a :href=content :download=file_name class="im_file_name" target="_blank">{{file_name}}</a></div>
                    </div>
                    <div class="im_file_icon_div_left">
                        <div class="im_file_icon">
                            <Icon :size=40 type="ios-folder-outline"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import res_avatar1 from '../assets/img/avatar1.png';

    export default {
        name: 'IMFileLeft',
        data() {
            //return store.state
            return {}
        },
        props: {
            /*value: {
                type: Boolean,
                default: false
            },
            username: String*/
            ts: {
                type: String,
                default() {
                    return '00:00:00';
                }
            },
            uname: {
                type: String,
                default() {
                    return '';
                }
            },
            content: {
                type: String,
                default() {
                    return '';
                }
            },
            file_name: {
                type: String,
                default() {
                    return '';
                }
            },
            avatar: {
                type: String,
                default() {
                    return res_avatar1;
                }
            },
            target: {
                type: Number,
                default() {
                    return 0;
                }
            },
        },
        methods: {
            /*downloadFile(url) {
                this.$store.dispatch('showIMImageModal', {'url': url}).then(null);
            }*/
        },
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped src="../assets/css/im-comp.less"></style>


