/**
 * 1. Render Song
 * 2. Scroll top
 * 3. Play / Pause/ Seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'CODE_MUSIC_PLAYER_SETTINGS'

const player = $('.player');
const progress = $('#progress');
const cd = $('.cd');
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playlist = $('.playlist')
const btnPlay = $('.btn-toggle-play')
const btnNext = $('.btn-next');
const btnPrev = $('.btn-prev');
const btnRepeat = $('.btn-repeat');
const btnRandom = $('.btn-random');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
            name: 'Bad Guy',
            singer: 'Billie Eilish',
            path: './assets/song/badguy.mp3',
            img: './assets/img/billieeilish.jpeg'
        },
        {
            name: 'RUN - BTS (Proof Album)',
            singer: 'BTS',
            path: './assets/song/run.mp3',
            img: './assets/img/bts.jpeg'
        },
        {
            name: 'Woman',
            singer: 'Doja Cat',
            path: './assets/song/woman.mp3',
            img: './assets/img/dojacat.jpeg'
        },
        {
            name: 'Cry For Me - Twice (Japanese Album Ver)',
            singer: 'Twice',
            path: './assets/song/cryforme.mp3',
            img: './assets/img/twice.jpeg'
        },
        {
            name: 'Good 4 U',
            singer: 'Olivia Rodrygo',
            path: './assets/song/goodforu.mp3',
            img: './assets/img/oliviarodrygo.jpeg'
        },
        {
            name: 'How You Like That',
            singer: 'BlackPink',
            path: './assets/song/howulikethat.mp3',
            img: './assets/img/blackpink.jpeg'
        },
        {
            name: 'Stay',
            singer: 'Justin Bieber',
            path: './assets/song/stay.mp3',
            img: './assets/img/justinbieber.jpeg'
        },
        {
            name: 'Light Switch',
            singer: 'Charlie Puth',
            path: './assets/song/lightswitch.mp3',
            img: './assets/img/charlieputh.jpeg'
        },
        {
            name: 'Love Cherry Motion',
            singer: 'LOONA',
            path: './assets/song/lovecherrymotion.mp3',
            img: './assets/img/loona.jpeg'
        },
        {
            name: 'We Are Good',
            singer: 'Selena Gomez',
            path: './assets/song/wearegood.mp3',
            img: './assets/img/selenagomez.png'
        },

    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    renderSongList: function() {
        const htmls = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.img}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="options">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`
        })

        playlist.innerHTML = htmls.join('\n');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth
        const _this = this;

        //Handle CD rotate and stop
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity,
        })

        cdThumbAnimate.pause();

        //handle zoom in/ zoom out CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Handle when click on play button
        btnPlay.onclick = () => {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play();
            }
        }

        //When song is playing, btnPlay will listen event click instantly
        audio.onplay = () => {
            this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        //When song is paused, btnPlay will listen event click instantly
        audio.onpause = () => {
            this.isPlaying = false;
            player.classList.remove('playing')
            cdThumbAnimate.pause();
        }

        //When song's progress was changed
        audio.ontimeupdate = () => {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //Handle when forward the speed of songs
        progress.onchange = (e) => {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //Handle when user click next songs button
        btnNext.onclick = () => {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.renderSongList();
            _this.scrollToActiveSong();
        }

        //Handle when user click prev songs button
        btnPrev.onclick = () => {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.renderSongList();
            _this.scrollToActiveSong();
        }

        //Handle when user click random songs button
        btnRandom.onclick = () => {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            btnRandom.classList.toggle('active', _this.isRandom);
        }

        //Handle system automatic next song when audio ended
        audio.onended = () => {
            if (_this.isRepeat) {
                audio.play();
            } else {
                btnNext.click();
            }

        }

        //Handle when user click repeat song
        btnRepeat.onclick = () => {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            btnRepeat.classList.toggle('active', _this.isRepeat);
        }

        //Listen the behavior of click action on playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.options')

            if (songNode || optionNode) {
                //Handle when click the song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong();
                    _this.renderSongList();
                    audio.play();
                }
                //handle when click the options 
                if (optionNode) {
                    console.log('The function were being to develop - Sorry bout that, sir')
                }

            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 100)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path

    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();

    },

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        //assign config to app
        this.loadConfig();

        //Define any attributes for objects 
        this.defineProperties()

        //Listen and handle all events(DOM Events)
        this.handleEvents()

        //Upload info the first song to UI when run the app
        this.loadCurrentSong()

        //Render playlist
        this.renderSongList()

        //Display the status at first of button Random and Repeat
        btnRepeat.classList.toggle('active', this.isRepeat);
        btnRandom.classList.toggle('active', this.isRandom);
    }
};

app.start();