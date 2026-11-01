// Everything editable about the site lives here.
export default {
  name: "Uros Stefanovic",
  domain: "stef000.dev",
  role: "C# / .NET developer · C++ · desktop tooling",
  tagline: "I build desktop software, render things, and run my own infrastructure.",
  email: "uros@stef000.dev",
  github: "stefanovic000",
  location: "Serbia · CET",

  socials: [
    { label: "GitHub", href: "https://github.com/stefanovic000" },
    { label: "Email", href: "mailto:uros@stef000.dev" },
    { label: "RSS", href: "/feed.xml" }
  ],

  // Shown on the home page and on /projects. First two get the larger treatment.
  projects: [
    {
      name: "ReverseReverb",
      desc: "Turns a sound into a reversed reverb lead-in. Drop a file, shape the tail, export a WAV or drag it into FL Studio.",
      tags: ["C++", "JUCE", "audio"],
      href: "https://github.com/stefanovic000/ReverseReverb",
      year: "2026",
      image: "/assets/images/reversereverb.png"
    },    {
      name: "goodsharing",
      desc: "Windows screen sharing over a self-hosted LiveKit SFU: WGC capture, hardware H.264, E2EE, a Qt Quick UI and a measurement harness.",
      tags: ["C++", "Qt", "WebRTC"],
      href: "https://github.com/stefanovic000/goodsharing",
      year: "2026",
      image: "/assets/images/goodsharing.png",
      tint: ["#2f6572", "#0f242c"]
    },
    {
      name: "stef000.dev",
      desc: "This site. Markdown in, static HTML out, served by Caddy on an Oracle ARM box with a small studio app for writing.",
      tags: ["Node", "Caddy", "self-hosted"],
      href: "https://github.com/stefanovic000/stef000.dev",
      year: "2026",
      image: "/assets/images/stef000-dev.png",
      tint: ["#8a5a2a", "#241608"]
    }
  ],

  // Short version for the home page; the full one lives in content/cv.md
  about:
    "I build desktop software in C# and C++, mostly tools that touch graphics, capture and 3D data, and I run the machines that serve them. Most of what I know came from breaking something and having to fix it.",

  available: "Open to work — C# / .NET · C++",

  capabilities: [
    {
      title: "C# & .NET desktop",
      text: "WinForms and .NET Framework — internal tools where the UI has to stay responsive and the data has to be right."
    },
    {
      title: "C++ & graphics",
      text: "Native capture pipelines, RenderDoc and Blender: turning a rendered frame into geometry you can use."
    },
    {
      title: "Systems & infra",
      text: "Linux boxes, TLS, reverse proxies, deploy pipelines. I run the servers my own projects live on."
    }
  ],

  skills: ["C#", ".NET Framework", "WinForms", "C++", "JUCE", "Qt", "WebRTC", "Direct3D", "Blender", "RenderDoc", "Linux", "Node", "Git"],

  // Add entries here and they appear on both the home page and /cv.
  // { role: "", company: "", period: "", note: "" }
  experience: []
};
