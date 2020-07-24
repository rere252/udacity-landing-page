class ComponentBuilder {
  getTemplate() {
    throw new TypeError('"getTemplate" method not implemented');
  }

  // https://stackoverflow.com/a/35385518/3936587
  elementFromHTML(htmlTemplate) {
    const templateEl = document.createElement('template');
    templateEl.innerHTML = htmlTemplate;
    return templateEl.content.firstElementChild;
  }

  build() {
    return this.elementFromHTML(this.getTemplate().trim());
  }
}

class NavbarBuilder extends ComponentBuilder {
  constructor(parent) {
    super();
    this.parent = parent;
  }

  getTemplate() {
    const navItems = Array.from(this.parent.querySelectorAll('section')).map(
      (el) => el.id
    );
    return `
      <header>
        <nav class="navbar">
          <ul class="navbar__items">
            ${navItems
              .map(
                (navItem) =>
                  `<li class="navbar__item"><a class="navbar__link" href="#${navItem}">${navItem}</a></li>`
              )
              .join('')}
          </ul>
        </nav>
      </header>
    `;
  }
}

class SectionBuilder extends ComponentBuilder {
  constructor(idx, navItem, title, ...paragraphs) {
    super();
    this.idx = idx;
    this.navItem = navItem;
    this.title = title;
    this.paragraphs = paragraphs;
  }

  getTemplate() {
    const modifier = this.idx % 2 === 0 ? 'section--even' : 'section--odd';
    return `
      <section class="section ${modifier}" id="${this.navItem}">
        <h2>${this.title}</h2>
        ${this.paragraphs.map((p) => `<p>${p}</p>`).join('')}
      </section>
    `;
  }
}

class IntroSectionBuilder extends SectionBuilder {
  constructor(introHeader, idx, navItem, title, ...paragraphs) {
    super(idx, navItem, title, ...paragraphs);
    this.introHeader = introHeader;
  }

  build() {
    const section = super.build();
    const heading = this.elementFromHTML(
      `<h1 class="section__intro-title">${this.introHeader}</h1>`
    );
    section.insertBefore(heading, section.firstElementChild);
    return section;
  }
}

class FooterBuilder extends ComponentBuilder {
  getTemplate() {
    return `
      <footer>
        <div>Udacity Front End Web Developer Nanodegree Program Project #2: Landing Page</div>
      </footer>
    `;
  }
}

class ActiveSection {
  constructor(element, distanceFromCenter) {
    this.element = element;
    this.distanceFromCenter = distanceFromCenter;
  }
}

class App {
  sectionsObserver;
  // Holds the element to highlight.
  activeSection;

  init() {
    const fragment = new DocumentFragment();
    this.initSections(fragment);
    // Navbar is supposed to be dynamic and determined by the sections (project requirement).
    this.initNavbar(fragment);
    this.initFooter(fragment);
    // Render what's been built.
    this.attachToBody(fragment);
    this.listenForCenterSection();
  }

  attachToBody(fragment) {
    document.body.appendChild(fragment);
  }

  insertAsFirstChild(parent, element) {
    const firstChild = parent.firstChild;
    parent.insertBefore(element, firstChild);
  }

  initSections(parent) {
    let i = 0;
    const sections = [
      new IntroSectionBuilder(
        'You Have Landed!',
        ++i,
        'First',
        'Lorem ipsum dolor sit amet',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod tortor sed justo porta, et malesuada tortor tincidunt. Duis id posuere nibh. Curabitur sed aliquet nisl, eu placerat quam. Quisque congue mauris a eros cursus, cursus dictum ipsum imperdiet. Duis porttitor est vel tortor congue consequat. Suspendisse eget consequat orci. Suspendisse aliquet iaculis mauris, ac suscipit tortor. Duis interdum erat sed urna auctor accumsan. Maecenas et ligula ac justo hendrerit auctor non sed nisl. Suspendisse ullamcorper non leo at pretium. Fusce ornare ex ac augue ornare, non facilisis lectus eleifend.'
      ).build(),
      new SectionBuilder(
        ++i,
        'Second',
        'Fusce scelerisque facilisis arcu et finibus',
        'Fusce scelerisque facilisis arcu et finibus. Proin elementum dictum ante, quis hendrerit ligula tincidunt eget. Aenean urna lectus, semper at finibus vitae, dapibus iaculis sem. Duis sed orci id felis placerat molestie sed sed mi. Vestibulum venenatis velit eu maximus pharetra. In purus lectus, scelerisque sit amet lobortis vel, eleifend id ante. Vivamus semper nisi pretium, imperdiet dolor a, accumsan felis. Curabitur non lacinia ex. Sed egestas lobortis risus nec finibus. Ut volutpat mauris sapien, non blandit turpis lobortis non. Nam eu ipsum at dolor volutpat maximus a non tortor. Etiam et blandit lorem.',
        'Sed sodales mauris ut purus faucibus efficitur. In facilisis, metus non faucibus posuere, lectus ante convallis turpis, vitae auctor dolor ipsum vitae turpis. Nunc fermentum sagittis eleifend. Suspendisse quis nulla eros. Curabitur non sapien a augue cursus sodales. In venenatis sapien a sem imperdiet, sit amet varius sem maximus. Aenean eu tincidunt sapien, fermentum porta tellus. Maecenas fringilla vulputate mauris, ut lobortis eros aliquet at. Quisque facilisis congue lectus, non sodales risus efficitur eu. Sed vehicula rutrum interdum. Proin nec sem quis diam suscipit porttitor. Pellentesque sit amet feugiat neque. Fusce ultricies venenatis neque, eu pulvinar dolor sodales rhoncus. Curabitur cursus enim eget ante laoreet, ultricies rhoncus orci condimentum. Pellentesque lorem tortor, bibendum commodo est id, dapibus ullamcorper est. Ut feugiat risus eu placerat rutrum.'
      ).build(),
      new SectionBuilder(
        ++i,
        'Third',
        'Nunc leo odio',
        'Nunc leo odio, consequat sit amet sodales sed, tristique aliquam felis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed vestibulum accumsan dolor, eu sagittis dolor euismod eget. Etiam at enim libero. Nulla ultrices tincidunt suscipit. Mauris nec lacus sed arcu euismod molestie. Nulla sed cursus eros. In rhoncus sit amet mi eu vulputate. Suspendisse molestie, velit quis ullamcorper iaculis, libero lacus ultricies metus, a varius orci est vel dolor. Ut feugiat lectus non metus congue, et placerat augue vehicula. Donec quam lorem, sollicitudin eu turpis vitae, interdum facilisis sapien. In hac habitasse platea dictumst. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vestibulum, lacus semper auctor congue, lectus nulla convallis nunc, hendrerit venenatis diam odio vitae nibh.'
      ).build(),
      new SectionBuilder(
        ++i,
        'Fourth',
        'Suspendisse et lectus elit',
        'Suspendisse et lectus elit. Maecenas pellentesque dictum elementum. Quisque pharetra enim sit amet consectetur faucibus. Aenean non lacus lacinia, vulputate mi et, placerat est. Praesent mauris nisl, convallis a dignissim eu, placerat nec eros. Donec turpis velit, porta et magna eu, convallis gravida justo. Fusce non aliquet felis. Morbi mollis scelerisque malesuada. Maecenas auctor in dui ac cursus. Vestibulum ultrices massa sed dapibus ullamcorper. Aliquam at placerat ante. Quisque commodo, tellus ac pellentesque vestibulum, felis justo porttitor nunc, sed sagittis tortor quam ut ex. Maecenas quis ante a purus commodo bibendum. Suspendisse mattis ut urna sed maximus. Nulla quis metus a ipsum placerat pulvinar ac non nunc.'
      ).build(),
    ];

    const fragment = new DocumentFragment();
    for (const section of sections) {
      fragment.appendChild(section);
    }

    parent.appendChild(fragment);
  }

  initNavbar(parent) {
    const navbar = new NavbarBuilder(parent).build();
    this.initNavItemClickHandler(navbar);
    this.insertAsFirstChild(parent, navbar);
  }

  initNavItemClickHandler(navbar) {
    navbar.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        const elementId = e.target.hash.slice(1);
        const element = document.getElementById(elementId);
        const elementRect = element.getBoundingClientRect();
        window.scrollTo({
          behavior: 'smooth',
          left: 0,
          top: elementRect.y,
        });
      }
    });
  }

  initFooter(parent) {
    const footer = new FooterBuilder().build();
    parent.appendChild(footer);
  }

  listenForCenterSection() {
    window.addEventListener('scroll', () => this.setCenterSectionAsActive());
    // To activate the initial item without waiting for a scroll event.
    this.setCenterSectionAsActive();
  }

  setCenterSectionAsActive() {
    const centerY = window.innerHeight / 2;
    const centerX = window.innerWidth / 2;
    const sections = document
      .elementsFromPoint(centerX, centerY)
      .filter((e) => e.classList.contains('section'));
    if (sections.length > 0) {
      const centerSection = sections[0];
      if (!this.activeSection || centerSection.id !== this.activeSection.id) {
        this.setAsActive(centerSection);
      }
    }
  }

  setAsActive(sectionToActivate) {
    const sectionActive = 'section--active';
    if (this.activeSection) {
      this.activeSection.classList.toggle(sectionActive);
    }
    sectionToActivate.classList.toggle(sectionActive);
    this.activeSection = sectionToActivate;
  }
}

new App().init();
