import React, { useState, useEffect } from "react";
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { github, close, arrowleft, arrowright} from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  images,
  source_code_link,
  onImageClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <Tilt
        options={{ max: 45, scale: 1, speed: 450 }}
        className="xs:w-[360px] w-full"
      >
        <motion.div
          className="w-full orange-yellow-gradient p-[1px] rounded-[20px] shadow-card"
        >
          <div className="bg-tertiary p-5 rounded-[20px] min-h-[280px]">
            <div
              className="relative w-full h-[230px] cursor-pointer"
              onClick={() => onImageClick({ images, initialIndex: currentImageIndex })}
            >
              <img
                src={images[currentImageIndex]}
                alt="project_image"
                className="w-full h-full object-cover rounded-2xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <img
                      src={arrowleft}
                      alt="previous"
                      className="w-6 h-6 object-contain"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <img
                      src={arrowright}
                      alt="next"
                      className="w-6 h-6 object-contain"
                    />
                  </button>
                </>
              )}

              <div className="absolute inset-0 flex justify-end m-3 card-img_hover">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(source_code_link, "_blank");
                  }}
                  className="orange-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
                >
                  <img
                    src={github}
                    alt="source code"
                    className="w-1/2 h-1/2 object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-white font-bold text-[24px]">{name}</h3>
              <p className="mt-2 text-secondary text-[14px]">{description}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <p
                  key={`${name}-${tag.name}`}
                  className={`text-[14px] ${tag.color}`}
                >
                  #{tag.name}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </Tilt>
    </motion.div>
  );
};

const Works = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  const handlePrev = () => {
    if (selectedProject) {
      const newIndex =
        selectedProject.currentIndex === 0
          ? selectedProject.images.length - 1
          : selectedProject.currentIndex - 1;
      setSelectedProject({ ...selectedProject, currentIndex: newIndex });
    }
  };

  const handleNext = () => {
    if (selectedProject) {
      const newIndex =
        selectedProject.currentIndex === selectedProject.images.length - 1
          ? 0
          : selectedProject.currentIndex + 1;
      setSelectedProject({ ...selectedProject, currentIndex: newIndex });
    }
  };

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleKeyDown = (e) => {
      if (!selectedProject) return;
      if (e.key === "Escape") {
        setSelectedProject(null);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  const handleImageClick = ({ images, initialIndex }) => {
    setSelectedProject({ images, currentIndex: initialIndex });
  };

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText}`}>My work</p>
        <h2 className={styles.sectionHeadText} style={{ color: "#FF9A00" }}>
          Projects
        </h2>
      </motion.div>

      <div className="w-full flex">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]"
        >
          Here are some of my projects. Real-world examples that highlight my skills, creativity, and problem-solving. Each one comes with code and live demos, showing how I work with different technologies to bring ideas to life.
        </motion.p>
      </div>

      <div className="mt-20 flex flex-wrap gap-7">
        {projects.map((project, index) => (
          <ProjectCard
            key={`project-${index}`}
            index={index}
            {...project}
            onImageClick={handleImageClick}
          />
        ))}
      </div>

{selectedProject && (
  <div
    className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
    onClick={() => setSelectedProject(null)}
  >
    <div
      className="relative max-w-5xl w-full max-h-[90vh] overflow-auto px-4"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        className="w-full orange-yellow-gradient p-[1px] rounded-[20px]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-tertiary p-5 rounded-[20px]">
          <button
            onClick={() => setSelectedProject(null)}
            className="absolute top-4 right-10 z-50"
          >
            <img
              src={close}
              alt="close"
              className="w-[36px] h-[60px] object-contain cursor-pointer"
            />
          </button>

          {selectedProject.images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-opacity"  // Slight left padding adjustment
              >
                <img
                  src={arrowleft}
                  alt="previous"
                  className="w-8 h-8 object-contain"
                />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-opacity"  // Slight right padding adjustment
              >
                <img
                  src={arrowright}
                  alt="next"
                  className="w-8 h-8 object-contain"
                />
              </button>
            </>
          )}

          <img
            src={selectedProject.images[selectedProject.currentIndex]}
            alt="Preview"
            className="w-full h-auto max-h-[75vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      </motion.div>
    </div>
  </div>
)}
    </>
  );
};

export default SectionWrapper(Works, "work");