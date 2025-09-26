import {

  about,
  work,
  contact,

  web,
  frontend,
  backend,
  game,

  github,

  taskmate_loading_screen,
  taskmate_log_in,
  taskmate_create_account,
  taskmate_create_account_details,
  taskmate_home,
  taskmate_side_bar,
  taskmate_filter,
  taskmate_add_task,
  taskmate_edit_task,
  taskmate_delete_task,
  taskmate_user_details,

  rainforest_admin_login,
  rainforest_dashboard,
  rainforest_product_ui,
  rainforest_add_product,
  rainforest_view_product,
  rainforest_edit_product,
  rainforest_detailed_email,
  rainforest_generate_report,
  rainforest_report_page1,
  rainforest_report_page2,

  library_ops_sign_in,
  library_ops_create_account,
  library_ops_homepage,
  library_ops_product_page,
  library_ops_cart,
  library_ops_check_out,
  library_ops_account_details,
  library_ops_adminpanel_admin_log_in,
  library_ops_adminpanel_dashboard,
  library_ops_adminpanel_product_list,
  library_ops_adminpanel_order_list,
  library_ops_adminpanel_admin_details,

  html,
  css,
  php,
  sql,
  java,
  javascript,
  reactjs,
  tailwind,
  threejs,
  git,

} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
    icon: about,
  },
  {
    id: "work",
    title: "Work",
    icon: work,
  },
  {
    id: "contact",
    title: "Contact",
    icon: contact,
  },
];

const services = [
  {
    title: "Web Developer",
    icon: web,
  },
  {
    title: "Frontend Developer",
    icon: frontend,
  },
  {
    title: "Backend Developer",
    icon: backend,
  },
    {
    title: "Game Developer",
    icon: game,
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "PHP",
    icon: php,
  },
  {
    name: "SQL",
    icon: sql,
  },
  {
    name: "Java",
    icon: java,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
  {
    name: "git",
    icon: git,
  },
];

const projects = [
  {
    name: "TaskMate",
    description:
      "A mobile task management application enabling users to create, update, and receive task notifications.",
    tags: [
      {
        name: "Java",
        color: "blue-text-gradient",
      },
      {
        name: "APIs",
        color: "green-text-gradient",
      },
      {
        name: "Firebase",
        color: "pink-text-gradient",
      },
      {
        name: "AndroidStudio",
        color: "orange-text-gradient",
      },
    ],
    images: [
      taskmate_home,
      taskmate_loading_screen,
      taskmate_log_in,
      taskmate_create_account,
      taskmate_create_account_details,
      taskmate_side_bar,
      taskmate_filter,
      taskmate_add_task,
      taskmate_edit_task,
      taskmate_delete_task,
      taskmate_user_details,
    ],
    source_code_link: "https://github.com/akiyoshiyapa",
  },
  {
    name: "RainForest Tea",
    description:
      "A desktop app for managing tea products, orders, inventory, suppliers, customers, and equipment with full CRUD operations.",
    tags: [
      {
        name: "Java",
        color: "blue-text-gradient",
      },
      {
        name: "JavaFX",
        color: "red-pink-text-gradient",
      },
      {
        name: "CSS",
        color: "gold-yellow-text-gradient",
      },
      {
        name: "MySQL",
        color: "teal-aqua-text-gradient",
      },
      {
        name: "IntelliJ",
        color: "indigo-blue-text-gradient",
      },
    ],
    images: [
      rainforest_dashboard,
      rainforest_admin_login,
      rainforest_product_ui,
      rainforest_add_product,
      rainforest_view_product,
      rainforest_edit_product,
      rainforest_detailed_email,
      rainforest_generate_report,
      rainforest_report_page1,
      rainforest_report_page2,
    ],
    source_code_link: "https://github.com/akiyoshiyapa",
  },
  {
    name: "LibraryOps",
    description:
      "A fully functional website for browsing, ordering, and managing books with an integrated MySQL database.",
    tags: [
      {
        name: "HTML",
        color: "sunset-text-gradient",
      },
      {
        name: "CSS",
        color: "gold-yellow-text-gradient",
      },
      {
        name: "JS",
        color: "rose-peach-text-gradient",
      },
      {
        name: "PHP",
        color: "silver-white-text-gradient",
      },
      {
        name: "MySQL",
        color: "teal-aqua-text-gradient",
      },
      {
        name: "VS Code",
        color: "cyan-purple-text-gradient",
      },
    ],
    images: [
      library_ops_homepage,
      library_ops_sign_in,
      library_ops_create_account,
      library_ops_product_page,
      library_ops_cart,
      library_ops_check_out,
      library_ops_account_details,
      library_ops_adminpanel_admin_log_in,
      library_ops_adminpanel_dashboard,
      library_ops_adminpanel_product_list,
      library_ops_adminpanel_order_list,
      library_ops_adminpanel_admin_details,
    ],
    source_code_link: "https://github.com/akiyoshiyapa",
  },
];

export { services, technologies, projects };