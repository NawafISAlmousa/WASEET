
// getting the elements to add an event listener to them 
const aboutEl = document.querySelector('.About')
const contactEl = document.querySelector('.Contact')
const loginEl = document.querySelector('.Login-btn')
const nav = document.querySelector('header');

// adding event listener for each one
aboutEl.addEventListener('click', function () {
    document.querySelector('.part2 h1').scrollIntoView({ behavior: 'smooth' })
})

contactEl.addEventListener('click', function () {
    document.querySelector('footer').scrollIntoView({ behavior: 'smooth' })
})




let lastScrollPosition = 0;

window.addEventListener('scroll', function () {
    const currentScrollPosition = window.scrollY;

    // Check if the user is scrolling down
    if (currentScrollPosition > lastScrollPosition) {
        // Scrolling down - hide the navbar
        nav.style.top = '-60px'; // Adjust this value based on your navbar height
    } else {
        // Scrolling up - show the navbar
        nav.style.top = '0';
    }

    // Update last scroll position
    lastScrollPosition = currentScrollPosition;
});



const translations = {
    en: {
        aboutUs: "About Us",
        contactUs: "Contact Us",
        login: "Log in",
        tagline: "Connecting Communities, One Service at a Time.",
        mainContent: "Your trusted bridge between local services and customers, making it easier to find the right professionals in your community.",
        joinUs: "Join us",
        customersHeader: "Customers",
        customersText: "Looking for local services? Our platform makes it easy to find and compare businesses near you. Search by location, price, or service type, and discover the best options in your area. It's all about making your search simple and connecting you with your community.",
        providersHeader: "Providers",
        providersText: "Our platform helps local businesses connect with nearby customers. It's a simple space where you can showcase your services, reach more people, and grow your presence in the community. With easy-to-use mapping features, your business is always just a search away.",
        footerText: "We would love to hear your feedback, so do not hesitate!"
    },
    ar: {
        aboutUs: "معلومات عنا",
        contactUs: "اتصل بنا",
        login: "تسجيل الدخول",
        tagline: "ربط المجتمعات، خدمة واحدة في كل مرة.",
        mainContent: "جسرك الموثوق بين الخدمات المحلية والعملاء، مما يجعل من السهل العثور على المحترفين المناسبين في مجتمعك.",
        joinUs: "انضم إلينا",
        customersHeader: "العملاء",
        customersText: "تبحث عن خدمات محلية؟ منصتنا تجعل من السهل العثور على ومقارنة الأعمال بالقرب منك. ابحث حسب الموقع أو السعر أو نوع الخدمة واكتشف أفضل الخيارات في منطقتك. الأمر كله يتعلق بتبسيط بحثك وربطك بمجتمعك.",
        providersHeader: "مزودون",
        providersText: "تساعد منصتنا الشركات المحلية على الاتصال بالعملاء القريبين. إنه مكان بسيط يمكنك فيه عرض خدماتك، والوصول إلى المزيد من الأشخاص، وزيادة تواجدك في المجتمع. مع ميزات الخرائط سهلة الاستخدام، سيكون عملك دائمًا على بعد بحث واحد.",
        footerText: "نود أن نسمع منك، لذا لا تتردد في التواصل معنا!"
    }
};

// to switch between languages (false = English , True = Arabic)
let isArabic = false

function switchLanguage() {
    if (!isArabic) {
        document.querySelector('.About').textContent = translations.ar.aboutUs;
        document.querySelector('.Contact').textContent = translations.ar.contactUs;
        document.querySelector('.login-btn').textContent = translations.ar.login;
        document.querySelector('.tagline').textContent = translations.ar.tagline;
        document.querySelector('.main-content p').textContent = translations.ar.mainContent;
        document.querySelector('.join-btn').textContent = translations.ar.joinUs;
        document.querySelector('.customer h1').innerHTML = `<i class="fa-solid fa-user" style="color: #ffffff;"></i><br>${translations.ar.customersHeader}`;
        document.querySelector('.customer p').textContent = translations.ar.customersText;
        document.querySelector('.provider h1').innerHTML = `<i class="fa-solid fa-store" style="color: #ffffff;"></i><br>${translations.ar.providersHeader}`;
        document.querySelector('.provider p').textContent = translations.ar.providersText;
        document.querySelector('.footer-text').textContent = translations.ar.footerText;
        isArabic = true
        document.querySelector(".arabic-btn").textContent = 'English'
    } else {
        document.querySelector('.About').textContent = translations.en.aboutUs;
        document.querySelector('.Contact').textContent = translations.en.contactUs;
        document.querySelector('.login-btn').textContent = translations.en.login;
        document.querySelector('.tagline').textContent = translations.en.tagline;
        document.querySelector('.main-content p').textContent = translations.en.mainContent;
        document.querySelector('.join-btn').textContent = translations.en.joinUs;
        document.querySelector('.customer h1').innerHTML = `<i class="fa-solid fa-user" style="color: #ffffff;"></i><br>${translations.en.customersHeader}`;
        document.querySelector('.customer p').textContent = translations.en.customersText;
        document.querySelector('.provider h1').innerHTML = `<i class="fa-solid fa-store" style="color: #ffffff;"></i><br>${translations.en.providersHeader}`;
        document.querySelector('.provider p').textContent = translations.en.providersText;
        document.querySelector('.footer-text').textContent = translations.en.footerText;
        isArabic = false
        document.querySelector(".arabic-btn").textContent = 'Arabic'
    }
}



document.querySelector(".arabic-btn").addEventListener('click', switchLanguage)