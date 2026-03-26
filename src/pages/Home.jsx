import { useEffect } from 'react';
import '../styles/Home.css';

function Home() {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal-from-side');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="bio-section">
        <div className="home-content-width">
          <h2 className="section-title">About Me</h2>
          <div className="bio-wrapper reveal-from-side">
            <div className="bio-image">
              <img src="/assets/selfie.jpg" alt="Dillon Emberson" />
            </div>
            <div className="bio-content">
              <p>
                I'm a software developer based in Austin and a recent graduate from Texas State University.
                With strong foundations in OOP, data structures, and algorithms, I am eager to grow and apply my skills
                to projects that make a real difference. Whether that means improving everyday tools, optimizing systems, or
                collaborating with teams to take on meaningful challenges, I'm excited to build software that provides real-world
                value.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="experience-section">
        <div className="home-content-width">
          <h2 className="section-title">Experience</h2>
          <div className="experience-list">
            <article className="experience-card reveal-from-side">
              <div className="experience-card-inner">
                <img
                  src="/assets/global-career-accelerator-logo.png"
                  alt="The Global Career Accelerator"
                  className="experience-logo"
                />
                <div className="experience-card-main">
                  <div className="experience-card-top">
                    <h3>The Global Career Accelerator</h3>
                    <span className="experience-period">Summer 2024</span>
                  </div>
                  <p>
                    A participant in a professional training program partnered with Intel and the GRAMMYs where I analyzed
                    real-world data challenges. My duties included using SQL and Tableau to produce data-driven recommendations
                    for an Intel-sponsored project. Additionally, I analyzed audience behavior and A/B testing data to recommend
                    specific site improvements for Grammy.com. The role involved collaborating within an intercultural team to
                    develop data visualizations and share technical insights across the group.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="skills-section">
        <div className="home-content-width">
          <h2 className="section-title">Skills</h2>
          <div className="skills-cloud reveal-from-side">
            <span className="skill-chip">C++</span>
            <span className="skill-chip">Java</span>
            <span className="skill-chip">Python</span>
            <span className="skill-chip">JavaScript</span>
            <span className="skill-chip">React</span>
            <span className="skill-chip">HTML/CSS</span>
            <span className="skill-chip">SQL</span>
            <span className="skill-chip">Git</span>
            <span className="skill-chip">REST APIs</span>
            <span className="skill-chip">OOP</span>
            <span className="skill-chip">Data Structures</span>
            <span className="skill-chip">Algorithms</span>
            <span className="skill-chip">Tableau</span>
            <span className="skill-chip">p5.js</span>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
