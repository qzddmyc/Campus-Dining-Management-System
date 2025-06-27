document.addEventListener('DOMContentLoaded', async function () {

    // 左侧导航栏的切换
    const leftButtons = document.querySelectorAll('.nav-item');
    const rightWholePages = document.querySelectorAll('.information');

    leftButtons.forEach(buts => {
        buts.addEventListener('click', function () {
            if (this.classList.contains('nav-choosen')) return;

            const targetId = this.dataset.tarid;

            document.querySelector('.left-area .nav-choosen').classList.remove('nav-choosen');
            this.classList.add('nav-choosen');

            rightWholePages.forEach(rightPage => {
                if (!rightPage.classList.contains('hidden')) {
                    rightPage.classList.add('hidden');
                }
            });
            document.getElementById(targetId).classList.remove('hidden');
            // console.log('11');

        })
    });

    // 右侧各个导航栏的切换
    const allRightButtons = document.querySelectorAll('.info-nav-data');

    allRightButtons.forEach(smallBut => {
        smallBut.addEventListener('click', function () {
            if (this.classList.contains('nav-choosen')) return;

            const targetId = this.dataset.tarid;

            document.querySelector('.information:not(.hidden) .nav-choosen').classList.remove('nav-choosen');
            this.classList.add('nav-choosen');

            const smallPages = document.querySelectorAll(`.${this.dataset.tarset}`);

            smallPages.forEach(page => {
                if (!page.classList.contains('hidden')) {
                    page.classList.add('hidden');
                }
            });
            document.getElementById(targetId).classList.remove('hidden');
            // console.log('22');

        })
    });

});