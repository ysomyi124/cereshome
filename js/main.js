(function(){
    "use strict";

    /* =========================================
       1. 헤더 스크롤 고정 + 패럴랙스 스크롤
    ========================================= */
    var header = document.getElementById('siteHeader');
    var bannerWrap = document.querySelector('.main_ad');
    var bannerEl = document.getElementById('parallaxBanner');
    var ticking = false;

    function updateOnScroll(){
        if(header){
            header.classList.toggle('scrolled', window.scrollY > 10);
        }

        if(bannerWrap && bannerEl){
            var rect = bannerWrap.getBoundingClientRect();
            var offset = rect.top * 0.2;
            offset = Math.max(-60, Math.min(60, offset));
            bannerEl.style.transform = 'translateY(' + offset + 'px)';
        }

        ticking = false;
    }

    window.addEventListener('scroll', function(){
        if(!ticking){
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });

    updateOnScroll();

    /* =========================================
       2. 모바일 / 태블릿 메뉴 토글
    ========================================= */
    var navToggle = document.getElementById('navToggle');
    var siteNav = document.getElementById('siteNav');

    function closeNav(){
        if(siteNav) siteNav.classList.remove('open');
        if(navToggle){
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    if(navToggle && siteNav){
        navToggle.addEventListener('click', function(){
            var isOpen = siteNav.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        siteNav.querySelectorAll('a').forEach(function(link){
            link.addEventListener('click', closeNav);
        });

        window.addEventListener('resize', function(){
            if(window.innerWidth > 1024) closeNav();
        });
    }

    /* =========================================
       3. 스크롤 reveal / stagger animation
    ========================================= */
    var revealTargets = document.querySelectorAll('.reveal, .stagger-group');

    if('IntersectionObserver' in window){
        var revealObserver = new IntersectionObserver(function(entries, observer){
            entries.forEach(function(entry){
                if(entry.isIntersecting){
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

        revealTargets.forEach(function(target){
            revealObserver.observe(target);
        });
    } else {
        revealTargets.forEach(function(target){
            target.classList.add('in-view');
        });
    }

    /* =========================================
       4. SHOP THE NEW - 스와이프 슬라이더 + 프로그레스 바
    ========================================= */
    var viewport = document.getElementById('sliderViewport');
    var track = document.getElementById('sliderTrack');
    var progressThumb = document.getElementById('progressThumb');

    if(viewport && track && progressThumb){
        var slides = Array.prototype.slice.call(track.children);
        var total = slides.length;
        var index = 0;
        var itemsPerView = 4;
        var itemWidth = 0;
        var maxIndex = 0;

        var isDragging = false;
        var startX = 0;
        var prevTranslate = 0;
        var pointerId = null;

        function getItemsPerView(){
            var w = window.innerWidth;
            if(w <= 600) return 1;
            if(w <= 1024) return 2;
            return 4;
        }

        function measure(){
            itemsPerView = getItemsPerView();
            var firstRect = slides[0].getBoundingClientRect();
            var secondRect = slides.length > 1 ? slides[1].getBoundingClientRect() : null;
            itemWidth = secondRect ? (secondRect.left - firstRect.left) : firstRect.width;
            maxIndex = Math.max(0, total - itemsPerView);
            if(index > maxIndex) index = maxIndex;
            updateProgress();
        }

        function goTo(newIndex){
            index = Math.max(0, Math.min(newIndex, maxIndex));
            track.style.transform = 'translateX(' + (-index * itemWidth) + 'px)';
            updateProgress();
        }

        function updateProgress(){
            var thumbPercent = Math.min(100, (itemsPerView / total) * 100);
            var trackable = 100 - thumbPercent;
            var leftPercent = maxIndex > 0 ? (index / maxIndex) * trackable : 0;
            progressThumb.style.width = thumbPercent + '%';
            progressThumb.style.left = leftPercent + '%';
        }

        function dragStart(e){
            isDragging = true;
            pointerId = e.pointerId;
            startX = e.clientX;
            prevTranslate = -index * itemWidth;
            track.style.transition = 'none';
            viewport.classList.add('dragging');
            if(viewport.setPointerCapture) viewport.setPointerCapture(pointerId);
        }

        function dragMove(e){
            if(!isDragging) return;
            var dx = e.clientX - startX;
            track.style.transform = 'translateX(' + (prevTranslate + dx) + 'px)';
        }

        function dragEnd(e){
            if(!isDragging) return;
            isDragging = false;
            viewport.classList.remove('dragging');
            track.style.transition = '';

            var dx = (e.clientX || startX) - startX;
            var threshold = itemWidth * 0.18;

            if(dx <= -threshold){
                goTo(index + 1);
            } else if(dx >= threshold){
                goTo(index - 1);
            } else {
                goTo(index);
            }
        }

        viewport.addEventListener('pointerdown', dragStart);
        viewport.addEventListener('pointermove', dragMove);
        viewport.addEventListener('pointerup', dragEnd);
        viewport.addEventListener('pointercancel', dragEnd);
        viewport.addEventListener('pointerleave', function(e){
            if(isDragging) dragEnd(e);
        });

        viewport.addEventListener('dragstart', function(e){ e.preventDefault(); });

        var resizeTimer = null;
        window.addEventListener('resize', function(){
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function(){
                measure();
                goTo(index);
            }, 150);
        });

        measure();
        goTo(0);
    }
})();
