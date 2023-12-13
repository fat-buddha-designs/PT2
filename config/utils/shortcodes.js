const {html} = require('common-tags');

module.exports = {
  icon: function (name) {
    return `<svg class="icon icon--${name}" role="img" aria-hidden="true" width="24" height="24">
                    <use xlink:href="#svg-${name}"></use>
                </svg>`;
  },

  year: function () {
    return `${new Date().getFullYear()}`;
  },

  addyear: function () {
    return `${new Date(new Date().setFullYear(new Date().getFullYear() + 1))}`;
  },

  link: function (url, name) {
    return `<a href="${url}" aria-label="link to ${name}">${url}</a>`;
  },

  email: function (email, name) {
    return `<a href="mailto:${email}" aria-label="email ${name} at ${email}"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 128C0 92.65 28.65 64 64 64H448C483.3 64 512 92.65 512 128V384C512 419.3 483.3 448 448 448H64C28.65 448 0 419.3 0 384V128zM48 128V150.1L220.5 291.7C241.1 308.7 270.9 308.7 291.5 291.7L464 150.1V127.1C464 119.2 456.8 111.1 448 111.1H64C55.16 111.1 48 119.2 48 127.1L48 128zM48 212.2V384C48 392.8 55.16 400 64 400H448C456.8 400 464 392.8 464 384V212.2L322 328.8C283.6 360.3 228.4 360.3 189.1 328.8L48 212.2z"/></svg>${email}</a>`;
  },

  phone: function (telephone, telephoneDisplay, name) {
    return `<a href="tel:${telephone}" aria-label="call ${name} on ${telephone}"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M480.3 320.3L382.1 278.2c-21.41-9.281-46.64-3.109-61.2 14.95l-27.44 33.5c-44.78-25.75-82.29-63.25-108-107.1l33.55-27.48c17.91-14.62 24.09-39.7 15.02-61.05L191.7 31.53c-10.16-23.2-35.34-35.86-59.87-30.19l-91.25 21.06C16.7 27.86 0 48.83 0 73.39c0 241.9 196.7 438.6 438.6 438.6c24.56 0 45.53-16.69 50.1-40.53l21.06-91.34C516.4 355.5 503.6 330.3 480.3 320.3zM463.9 369.3l-21.09 91.41c-.4687 1.1-2.109 3.281-4.219 3.281c-215.4 0-390.6-175.2-390.6-390.6c0-2.094 1.297-3.734 3.344-4.203l91.34-21.08c.3125-.0781 .6406-.1094 .9531-.1094c1.734 0 3.359 1.047 4.047 2.609l42.14 98.33c.75 1.766 .25 3.828-1.25 5.062L139.8 193.1c-8.625 7.062-11.25 19.14-6.344 29.14c33.01 67.23 88.26 122.5 155.5 155.5c9.1 4.906 22.09 2.281 29.16-6.344l40.01-48.87c1.109-1.406 3.187-1.938 4.922-1.125l98.26 42.09C463.2 365.2 464.3 367.3 463.9 369.3z"/></svg>${telephoneDisplay}</a>`;
  },

  mobile: function (mobile, mobileDisplay, name) {
    return `<a href="tel:${mobile}" aria-label="call ${name} on ${mobile}"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M304 0h-224c-35.35 0-64 28.65-64 64v384c0 35.35 28.65 64 64 64h224c35.35 0 64-28.65 64-64V64C368 28.65 339.3 0 304 0zM320 448c0 8.822-7.178 16-16 16h-224C71.18 464 64 456.8 64 448V64c0-8.822 7.178-16 16-16h224C312.8 48 320 55.18 320 64V448zM224 400H160c-8.836 0-16 7.164-16 16s7.164 16 16 16h64c8.838 0 16-7.164 16-16S232.8 400 224 400z"/></svg>${mobileDisplay}</a>`;
  }
};
