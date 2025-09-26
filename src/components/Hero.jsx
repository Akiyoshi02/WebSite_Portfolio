import { motion } from "framer-motion";

import { styles } from "../styles";
import { SpaceshipCanvas } from "./canvas";

const Hero = () => {
  return (
    <section className={`relative w-full h-screen mx-auto`}>
      <div
        className={`absolute inset-0 top-[120px]  max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
      >
        <div className='flex flex-col justify-center items-center mt-5'>
          <div className='w-5 h-5 rounded-full bg-[#FF9A00]' />
          <div className='w-1 sm:h-56 h-56 orange-gradient' />
        </div>

        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            Hi, I'm <span className='text-[#FF9A00]'>Akiyoshi</span>
          </h1>
          <p className={`${styles.heroSubText} mt-2 text-white-100`}>
            Software Engineering undergraduate <br className='sm:block hidden' />
            eager to learn, code, lead, and innovate.
          </p>
        </div>
      </div>

      <SpaceshipCanvas />

      <div className='absolute xs:bottom-10 bottom-6 w-full flex justify-center items-center'>
        <a href='#about'>
          <div className='w-[36px] h-[56px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2'>
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className='w-3 h-3 rounded-full bg-secondary mb-1'
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;