document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     MENU MOBILE
  ========================= */

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }


  /* =========================
     FILTER PRODUK
  ========================= */

  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('#productGrid .product-card');

  filters.forEach(button => {
    button.addEventListener('click', () => {

      filters.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter;

      cards.forEach(card => {
        card.style.display =
          (filter === 'all' || card.dataset.category === filter)
            ? 'flex'
            : 'none';
      });

    });
  });


  /* =========================
     KERANJANG
     ========================= */

  const CART_KEY = 'susuMurniCart';

  let cart = [];

  try {
    const saved = localStorage.getItem(CART_KEY);
    cart = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(cart)) {
      cart = [];
    }
  } catch (error) {
    cart = [];
  }


  const cartButton = document.getElementById('cartButton');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCart = document.getElementById('closeCart');
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutCart = document.getElementById('checkoutCart');


  /* =========================
     FORMAT RUPIAH
  ========================= */

  const formatRupiah = (number) => {
    return 'Rp' + Number(number).toLocaleString('id-ID');
  };


  /* =========================
     SIMPAN CART
  ========================= */

  function saveCart() {

    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.warn('Keranjang tidak dapat disimpan.', error);
    }

    renderCart();
  }


  /* =========================
     RENDER CART
  ========================= */

  function renderCart() {

    const totalQty = cart.reduce(
      (sum, item) => sum + Number(item.qty || 0),
      0
    );

    const totalPrice = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.qty || 0),
      0
    );


    if (cartCount) {
      cartCount.textContent = totalQty;
    }


    if (cartTotal) {
      cartTotal.textContent =
        formatRupiah(totalPrice);
    }


    if (!cartItems) {
      return;
    }


    if (cart.length === 0) {

      cartItems.innerHTML = `
        <div class="cart-empty">
          Keranjang masih kosong.
          <br>
          <small>
            Pilih produk dan klik
            "Tambah ke Keranjang".
          </small>
        </div>
      `;

      if (checkoutCart) {
        checkoutCart.disabled = true;
      }

      return;
    }


    if (checkoutCart) {
      checkoutCart.disabled = false;
    }


    cartItems.innerHTML = cart.map(
      (item, index) => {

        const price = Number(item.price);
        const qty = Number(item.qty);

        return `
          <div class="cart-item">

            <div class="cart-item-info">

              <b>
                ${escapeHtml(item.name)}
              </b>

              <small>
                ${formatRupiah(price)} / pcs
              </small>

            </div>


            <div class="cart-item-actions">

              <button
                type="button"
                class="qty-btn"
                data-action="minus"
                data-index="${index}">
                −
              </button>

              <b>${qty}</b>

              <button
                type="button"
                class="qty-btn"
                data-action="plus"
                data-index="${index}">
                +
              </button>

              <button
                type="button"
                class="remove-btn"
                data-action="remove"
                data-index="${index}">
                Hapus
              </button>

            </div>


            <strong class="cart-item-subtotal">
              ${formatRupiah(price * qty)}
            </strong>

          </div>
        `;
      }
    ).join('');
  }


  /* =========================
     KEAMANAN TEKS CART
  ========================= */

  function escapeHtml(text) {

    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  }


  /* =========================
     BUKA CART
  ========================= */

  function openCart() {

    if (!cartDrawer) {
      return;
    }

    cartDrawer.classList.add('open');

    if (cartOverlay) {
      cartOverlay.classList.add('show');
    }

    document.body.classList.add('cart-open');

  }


  /* =========================
     TUTUP CART
  ========================= */

  function hideCart() {

    if (cartDrawer) {
      cartDrawer.classList.remove('open');
    }

    if (cartOverlay) {
      cartOverlay.classList.remove('show');
    }

    document.body.classList.remove('cart-open');

  }


  /* =========================
     TAMBAH PRODUK
     EVENT DELEGATION
     ========================= */

  document.addEventListener('click', (event) => {

    const button =
      event.target.closest('.add-to-cart');

    if (!button) {
      return;
    }


    event.preventDefault();


    const name =
      button.getAttribute('data-product-name');

    const price =
      Number(
        button.getAttribute('data-product-price')
      );


    if (!name || Number.isNaN(price) || price <= 0) {

      console.warn(
        'Produk belum memiliki data-product-name atau data-product-price.'
      );

      return;
    }


    const existing =
      cart.find(
        item =>
          item.name === name &&
          Number(item.price) === price
      );


    if (existing) {

      existing.qty =
        Number(existing.qty) + 1;

    } else {

      cart.push({
        name: name,
        price: price,
        qty: 1
      });

    }


    saveCart();

    openCart();


    const originalText =
      button.innerHTML;

    button.innerHTML =
      '✓ Ditambahkan';


    setTimeout(() => {

      button.innerHTML =
        originalText;

    }, 1000);

  });


  /* =========================
     PLUS / MINUS / HAPUS
  ========================= */

  document.addEventListener('click', (event) => {

    const button =
      event.target.closest('[data-action]');

    if (!button) {
      return;
    }


    const index =
      Number(button.dataset.index);

    const action =
      button.dataset.action;


    if (
      Number.isNaN(index) ||
      !cart[index]
    ) {
      return;
    }


    if (action === 'plus') {
      cart[index].qty =
        Number(cart[index].qty) + 1;
    }


    if (action === 'minus') {

      cart[index].qty =
        Number(cart[index].qty) - 1;

      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }

    }


    if (action === 'remove') {
      cart.splice(index, 1);
    }


    saveCart();

  });


  /* =========================
     EVENT CART
  ========================= */

  cartButton?.addEventListener(
    'click',
    openCart
  );


  closeCart?.addEventListener(
    'click',
    hideCart
  );


  cartOverlay?.addEventListener(
    'click',
    hideCart
  );


  /* =========================
     CHECKOUT WHATSAPP
  ========================= */

  checkoutCart?.addEventListener(
    'click',
    () => {

      if (!cart.length) {
        return;
      }


      const lines =
        cart.map(
          (item, index) => {

            return `${index + 1}. ${
              item.name
            } x${item.qty} = ${
              formatRupiah(
                Number(item.price) *
                Number(item.qty)
              )
            }`;

          }
        );


      const total =
        cart.reduce(
          (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.qty),
          0
        );


      const message =
        `Halo Susu Murni Nasional, ` +
        `saya ingin melakukan pemesanan:\n\n` +
        `${lines.join('\n')}` +
        `\n\n` +
        `Total sementara: ` +
        `${formatRupiah(total)}` +
        `\n\n` +
        `Mohon konfirmasi ketersediaan ` +
        `dan detail pengirimannya. ` +
        `Terima kasih.`;


      window.open(
        `https://wa.me/6281808119116?text=${encodeURIComponent(message)}`,
        '_blank'
      );

    }
  );


  /* =========================
     DROPDOWN MENU LAIN
  ========================= */

  const dropdowns =
    document.querySelectorAll(
      '.nav-dropdown'
    );


  dropdowns.forEach(dd => {

    const btn =
      dd.querySelector(
        '.nav-dropdown-toggle'
      );


    btn?.addEventListener(
      'click',
      (event) => {

        event.stopPropagation();

        const isOpen =
          dd.classList.toggle('open');

        btn.setAttribute(
          'aria-expanded',
          isOpen
        );

      }
    );

  });


  document.addEventListener(
    'click',
    event => {

      dropdowns.forEach(dd => {

        if (!dd.contains(event.target)) {

          dd.classList.remove('open');

          dd.querySelector(
            '.nav-dropdown-toggle'
          )?.setAttribute(
            'aria-expanded',
            'false'
          );

        }

      });

    }
  );


  /* =========================
     FILTER BLOG / KONTEN
  ========================= */

  document
    .querySelectorAll(
      '[data-filter-group]'
    )
    .forEach(group => {

      const buttons =
        group.querySelectorAll(
          'button[data-filter]'
        );

      const target =
        document.querySelector(
          group.dataset.filterGroup
        );


      if (!target) {
        return;
      }


      buttons.forEach(btn => {

        btn.addEventListener(
          'click',
          () => {

            buttons.forEach(
              b =>
                b.classList.remove(
                  'active'
                )
            );

            btn.classList.add('active');

            const filter =
              btn.dataset.filter;


            target
              .querySelectorAll(
                '[data-category]'
              )
              .forEach(card => {

                card.style.display =
                  (
                    filter === 'all' ||
                    card.dataset.category === filter
                  )
                    ? ''
                    : 'none';

              });

          }
        );

      });

    });


  /* =========================
     RENDER AWAL
  ========================= */

  renderCart();

});
