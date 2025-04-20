import { createTheme } from "@mantine/core";
import '@fonts/Altivo/Altivo.css';

export const theme = createTheme({
    fontFamily: 'Roboto, sans-serif',
    headings: {
        fontFamily: 'Roboto, sans-serif',
    },
    colors: {
        mainPurple: [
            '#EBE5FD',
            '#D6C9FB',
            '#C2ADF9',
            '#AD91F7',
            '#9975F5',
            '#845AF3',
            '#6A4CF2', // Original mainPurple
            '#5539D0',
            '#402AAE',
            '#2C1B8C'
        ],
        lightPurple: [
            '#FFFFFF',
            '#FCFCFD',
            '#F6F3FD',
            '#F2ECFD',
            '#EEE9FD',
            '#EAE6FD',
            '#EBE7FD', // Original lightPurple
            '#D7CFFB',
            '#C3B7F9',
            '#B0A0F7'
        ],
        bgPurple: [
            '#FFFFFF',
            '#FCFBFE',
            '#F6F2FD',
            '#F2ECFD',
            '#EEE8FD',
            '#EAE5FD',
            '#E9E4FD', // Original bgPurple
            '#D5CCFB',
            '#C2B4F9',
            '#AE9CF7'
        ],

        mainRed: [
            '#FEACA2',
            '#FF9589',
            '#FF7E6F',
            '#FF6B5D',
            '#FF5945',
            '#FF472D',
            '#FF6856', // Original mainRed
            '#FF513C',
            '#FF3A23',
            '#FF2309'
        ],

        mainGreen: [
            '#5DE5A3',
            '#47E197',
            '#31DE8A',
            '#26D983',
            '#24D680',
            '#23D57F',
            '#22D47E', // Original mainGreen
            '#1EBE70',
            '#1AA863',
            '#179256'
        ],
        lightGreen: [
            '#f2fff3',
            '#eeffef',
            '#e9ffec',
            '#e5ffe8',
            '#e1ffe4',
            '#dcffe0',
            '#d8ffdc', // Original lightGreen
            '#c0e3c4',
            '#a8c6ab',
            '#90aa93'
        ],

        mainOrange: [
            '#FECB4C',
            '#FFC432',
            '#FFBD19',
            '#FFB90C',
            '#FFB706',
            '#FFB603',
            '#FFB600', // Original mainOrange
            '#E5A300',
            '#CC9100',
            '#B27F00'
        ],
        mainBlue: [
            '#000000',
            '#000000',
            '#000000',
            '#0e313a',
            '#1c6274',
            '#2994ad',
            '#37c5e7', // Original mainBlue
            '#69d4ed',
            '#9be2f3',
            '#cdf0f9'
        ],
        lightBlue: [
            '#000000',
            '#000000',
            '#000000',
            '#323d40',
            '#647a80',
            '#96b7bf',
            '#c8f4ff', // Original lightBlue
            '#d6f7ff',
            '#e3faff',
            '#f1fcff'
        ],

        mainGrey: [
            '#e7e7e7',
            '#cecece',
            '#b6b6b6',
            '#9e9e9e',
            '#858585',
            '#797979',
            '#6d6d6d', // Original mainGrey
            '#525252',
            '#363636',
            '#1b1b1b'
        ],
        bgGrey: [
            '#FFFFFF',
            '#F8F8F8',
            '#F0F0F0',
            '#E8E8E8',
            '#E0E0E0',
            '#DCDCDC',
            '#D9D9D9', // Original bgGrey
            '#C0C0C0',
            '#A8A8A8',
            '#909090'
        ],
        lightGrey: [
            '#FFFFFF',
            '#FCFCFC',
            '#F8F8F8',
            '#F4F4F4',
            '#F2F2F2',
            '#F1F1F1',
            '#F0F0F0', // Original lightGrey
            '#E3E3E3',
            '#D6D6D6',
            '#C9C9C9'
        ]
    },
    shadows: {
        xxl: '0 8px 20px 0 rgba(0, 0, 0, 0.15), 0 16px 30px 0 rgba(0, 0, 0, 0.1)',
        xxxl: '8px 8px 20px 8px rgba(0, 0, 0, 0.15), 8px 16px 30px 8px rgba(0, 0, 0, 0.1)',
    },
});
