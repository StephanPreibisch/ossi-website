const base = import.meta.env.BASE_URL;

export const headerData = {
  links: [
    {
      text: "Home",
      href: base,
    },
    {
      text: "Projects",
      href: `${base}/projects`,
    },
    // {
    //   text: "Ecosystems",
    //   href: `${base}/ecosystems`,
    // },
    {
      text: "OSSI",
      href: `${base}/ossi`,
    },
    // {
    //   text: "Blog",
    //   href: `${base}/blog`,
    // },
  ],
};

export const footerData = {
  links: [],
  secondaryLinks: [
    {
      text: "Privacy Policy & Cookie Notice",
      href: "https://www.hhmi.org/privacy-policy",
    },
    {
      text: "View the source code on GitHub",
      href: "https://github.com/JaneliaSciComp/ossi-website",
    },
  ],
  socialLinks: [
    {
      ariaLabel: "Email",
      icon: "tabler:mail",
      href: "mailto:janeliawebsupport@janelia.hhmi.org",
    },
    {
      ariaLabel: "YouTube",
      icon: "tabler:brand-youtube",
      href: "https://www.youtube.com/@JaneliaSciComp",
    },
    {
      ariaLabel: "Github",
      icon: "tabler:brand-github",
      href: "https://github.com/JaneliaSciComp",
    },
  ],
  footNote: "© 2024 Howard Hughes Medical Institute",
};
