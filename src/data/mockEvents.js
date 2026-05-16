import partyIcon from '../assets/icons/party-fun-dance-enjoy-svgrepo-com.svg';
import laptopIcon from '../assets/icons/laptop-svgrepo-com.svg';
import musicIcon from '../assets/icons/music-svgrepo-com.svg';
import rocketIcon from '../assets/icons/rocket-svgrepo-com.svg';
import gamingIcon from '../assets/icons/gaming-svgrepo-com.svg';
import presentationIcon from '../assets/icons/presentation-chart-arrow-svgrepo-com.svg';

export const featuredEvents = [
  {
    id: 1,
    title: 'AI Summit 2024',
    date: 'May 18',
    month: 'MAY',
    day: '18',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    attendees: 120,
    category: 'Tech',
    featured: true,
    tags: ['AI', 'Tech', 'Workshop'],
    description: 'Join industry leaders and tech enthusiasts for an exciting day of talks, workshops, and networking.',
  },
  {
    id: 2,
    title: 'Music Festival',
    date: 'May 22',
    month: 'MAY',
    day: '22',
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
    attendees: 86,
    category: 'Music',
    featured: false,
    tags: ['Music', 'Live', 'Festival'],
    description: 'Experience the best live music performances from around the world.',
  },
  {
    id: 3,
    title: 'Startup Meetup',
    date: 'May 28',
    month: 'MAY',
    day: '28',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    attendees: 64,
    category: 'Startup',
    featured: false,
    tags: ['Startup', 'Networking', 'Business'],
    description: 'Connect with fellow entrepreneurs and investors in a collaborative environment.',
  },
  {
    id: 4,
    title: 'DevCon 2024',
    date: 'Jun 05',
    month: 'JUN',
    day: '05',
    location: 'Online',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
    attendees: 342,
    category: 'Tech',
    featured: false,
    tags: ['Dev', 'Conference', 'Online'],
    description: 'The biggest developer conference with workshops, talks, and hackathons.',
  },
  {
    id: 5,
    title: 'Gaming Expo',
    date: 'Jun 05',
    month: 'JUN',
    day: '05',
    location: 'Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop',
    attendees: 75,
    category: 'Gaming',
    featured: false,
    tags: ['Gaming', 'VR', 'Expo'],
    description: 'Explore the latest in gaming technology and play unreleased titles.',
  },
];

export const recommendedEvents = [
  {
    id: 6,
    title: 'Web Development Workshop',
    date: 'May 20, 2024',
    location: 'Boston, MA',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
    category: 'Tech',
  },
  {
    id: 7,
    title: 'UX Design Conference',
    date: 'May 24, 2024',
    location: 'Chicago, IL',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop',
    category: 'Design',
  },
  {
    id: 8,
    title: 'Blockchain Summit',
    date: 'May 28, 2024',
    location: 'Miami, FL',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop',
    category: 'Tech',
  },
  {
    id: 9,
    title: 'Digital Marketing Bootcamp',
    date: 'Jun 02, 2024',
    location: 'Seattle, WA',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop',
    category: 'Business',
  },
];

export const upcomingEvents = [
  { id: 1, date: 'May 18', title: 'AI Summit 2024', location: 'San Francisco, CA', color: '#8b5cf6' },
  { id: 2, date: 'May 22', title: 'Music Festival', location: 'Austin, TX', color: '#ec4899' },
  { id: 3, date: 'May 29', title: 'Startup Meetup', location: 'New York, NY', color: '#f97316' },
  { id: 4, date: 'Jun 05', title: 'Gaming Expo', location: 'Los Angeles, CA', color: '#3b82f6' },
];

export const categories = [
  { name: 'All', emoji: '' },
  { name: 'Tech', emoji: '💻' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Startup', emoji: '🌱' },
  { name: 'Gaming', emoji: '🎮' },
  { name: 'Workshops', emoji: '🏗️' },
  { name: 'Design', emoji: '🎨' },
  { name: 'Business', emoji: '💼' },
];


export const landingCategories = [
  { name: 'Parties', svg: partyIcon },
  { name: 'Tech', svg: laptopIcon },
  { name: 'Music', svg: musicIcon },
  { name: 'Startup', svg: rocketIcon },
  { name: 'Gaming', svg: gamingIcon },
  { name: 'Workshops', svg: presentationIcon },
];

export const testimonials = [
  {
    id: 1,
    name: 'Sarah J.',
    role: 'Event Organizer',
    rating: 5,
    text: '"EventHub made organizing my event so easy. The RSVP tracking is a game changer!"',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Mike D.',
    role: 'Community Lead',
    rating: 5,
    text: '"Beautiful invites, simple tools, and amazing support. Highly recommend!"',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Priya K.',
    role: 'Marketing Manager',
    rating: 5,
    text: '"Finally, an event platform that does everything I need and looks amazing doing it."',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

export const userProfile = {
  name: 'Vivek Kumar',
  username: 'vivek_kumar',
  email: 'vivek.kumar@email.com',
  phone: '+91 98765 43210',
  location: 'New Delhi, India',
  website: 'www.vivek.dev',
  bio: 'Passionate about technology and bringing people together through events.\nBuilding memorable experiences, one event at a time.',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  stats: {
    eventsCreated: 12,
    ticketsBooked: 34,
    eventsAttended: 28,
    savedEvents: 18,
    reviewsGiven: 7,
  },
};

export const whyEventHubFeatures = [
  { icon: '⭐', title: 'Beautiful event pages', desc: 'Impress your guests' },
  { icon: '👥', title: 'Smart RSVP tracking', desc: "Know who's coming" },
  { icon: '📍', title: 'Easy guest management', desc: 'Stay organized effortlessly' },
  { icon: '🛡️', title: 'Secure & reliable', desc: 'Your data is safe with us' },
];

export const calendarEvents = {
  18: true,
  22: true,
  28: true,
  29: true,
};

export const avatarGroup = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
];
