import React from "react";
import {
  fireEvent,
  getNodeText,
  screen,
  render,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react";
import { fabric } from "fabric";
import Router from "react-router";
import "@testing-library/jest-dom/extend-expect";
import fetchMock from "jest-fetch-mock";
import NewTrackingEditor from "../components/pages/newTrackingEditor/NewTrackingEditor";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
import {
  parseProcessedPlayers,
  parseProcessedBallTracks,
} from "../utils/csvParser";
import {
  mockCSV,
  mockCSVBall,
  mockLog,
  mockHomographies,
  mockFieldSize,
} from "./mocks/MockFiles";

import userEvent from "@testing-library/user-event";

beforeEach(() => {
  fetchMock.resetMocks();
  //by default useLocation doesn't return player data and video
  useLocation.mockReturnValue({
    state: {},
  });
});
afterEach(cleanup);
const user = userEvent.setup();
//mock useParams() and useLocation()
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}));
jest.spyOn(Router, "useParams").mockReturnValue({ videoName: "mockVideo" });

describe("data fetching", () => {
  it("receives correct annotation", async () => {
    //given
    useLocation.mockReturnValue({
      state: {
        //up to now only necessary to mock processedPlayers
        //should render player 1, 2 in frame0, discard player2 in frame1
        processedPlayers: mockCSV,
        video: undefined,
        ballTracks: undefined,
        homographies: mockHomographies,
        log: mockLog,
        fieldSize: mockFieldSize,
      },
    });
    const logSpy = jest.spyOn(global.console, "log");
    const mockAnnotation = parseProcessedPlayers(mockCSV);

    //when
    render(<NewTrackingEditor />);

    //then
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        "retrieved annotation:",
        mockAnnotation,
      );
    });
  });
});

describe("merge and swap functionality", () => {
  it("can merge players", async () => {
    useLocation.mockReturnValue({
      state: {
        //up to now only necessary to mock processedPlayers
        //should render player 1, 2 in frame0, discard player2 in frame1
        processedPlayers: mockCSV,
        video: undefined,
        ballTracks: undefined,
        homographies: undefined,
        log: undefined,
      },
    });

    render(<NewTrackingEditor />);

    const canvasElement = screen.getByTestId("fabric-canvas");
    const initialNumber = canvasElement.getAttribute("annotations");

    expect(initialNumber).toEqual("3");

    const validationButton = screen.getByTestId("mergeSwapModalplayer2");
    fireEvent.click(validationButton);

    const mergeRadioButton = screen.getByTestId("merge-label");
    fireEvent.click(mergeRadioButton);

    //open the dropdown menu
    const mergeSwapModalSelect = await screen.findByTestId("select-element");
    const combobox = await within(mergeSwapModalSelect).findByRole("button");
    await userEvent.click(combobox);

    //select player in dropdown menu
    const player1 = await screen.findByTestId("menuitemplayer1");
    await userEvent.click(player1);

    const applyButton = screen.getByTestId("mergeSwapModalApplyButton");
    fireEvent.click(applyButton);

    const newNumber = canvasElement.getAttribute("annotations");
    // Number of annotations should be decreased by 1
    expect(newNumber).toEqual("2");
  });
  it("can swap players", async () => {
    const mergeMockCSV =
      ",PlayerKey,FrameNo,x,y,w,h,x2,y2,x1,y1,x_trans,y_trans\n" +
      "0,1,0,377.03342250000003,50.19623244444445,86.61914,108.21205,2010.44047,201.42105500000002,1923.8213300000002,93.209005,12.295921059173809,-3.365857351237431\n" +
      "1,2,0,377.7366666666667,49.605735555555555,95.00244,108.161766,2018.30122,199.662933,1923.2987799999999,91.50116700000001,12.33124457968784,-3.382238612728461\n" +
      "2,3,1,377.9406,49.65448874074074,88.64612,110.22829,2016.18706,200.83927500000001,1927.54094,90.610985,12.334635147514817,-3.3870903957875074";

    useLocation.mockReturnValue({
      state: {
        //up to now only necessary to mock processedPlayers
        //should render player 1, 2 in frame0, discard player2 in frame1
        processedPlayers: mergeMockCSV,
        video: undefined,
        ballTracks: undefined,
        homographies: undefined,
        log: undefined,
      },
    });

    render(<NewTrackingEditor />);

    const canvasElement = screen.getByTestId("fabric-canvas");
    const initialNumber = canvasElement.getAttribute("annotations");

    expect(initialNumber).toEqual("3");

    // playerList has player1 and player2 since those are in the 0th frame
    const prevPlayerList = JSON.parse(canvasElement.getAttribute("playerlist"));
    expect(prevPlayerList.length).toEqual(2);
    expect(prevPlayerList[0].props.name).toEqual("player1");
    expect(prevPlayerList[1].props.name).toEqual("player2");

    const validationButton = screen.getByTestId("mergeSwapModalplayer2");
    fireEvent.click(validationButton);

    const mergeRadioButton = screen.getByTestId("swap-label");
    fireEvent.click(mergeRadioButton);

    //open the dropdown menu
    const mergeSwapModalSelect = await screen.findByTestId("select-element");
    const combobox = await within(mergeSwapModalSelect).findByRole("button");
    await userEvent.click(combobox);

    //select player in dropdown menu
    const player3 = await screen.findByTestId("menuitemplayer3");

    await userEvent.click(player3);

    const applyButton = screen.getByTestId("mergeSwapModalApplyButton");
    await fireEvent.click(applyButton);

    const newNumber = canvasElement.getAttribute("annotations");

    // Number of annotations should be the same
    expect(newNumber).toEqual("3");
    // The order of the players should be swapped
    const newPlayerList = JSON.parse(canvasElement.getAttribute("playerlist"));
    expect(newPlayerList.length).toEqual(2);
    // playerList has player1 and player3 since player2 and player3 are swapped
    expect(newPlayerList[0].props.name).toEqual("player1");
    expect(newPlayerList[1].props.name).toEqual("player3");
  });
});

describe("add player button", () => {
  it("increases length of annotations by 1", () => {
    render(<NewTrackingEditor />);

    //given
    const canvasElement = screen.getByTestId("fabric-canvas");
    const button = screen.getByTestId("add-player-button");
    const initialNumber = canvasElement.getAttribute("annotations");
    expect(initialNumber).toEqual("0");

    //when
    fireEvent.click(button);

    //then
    const updatedNumber = canvasElement.getAttribute("annotations");
    expect(updatedNumber).toEqual("1");
  });

  it("creates a bounding box in the canvas", async () => {
    render(<NewTrackingEditor />);

    //given
    const button = screen.getByTestId("add-player-button");
    const canvasElement = screen.getByTestId("fabric-canvas");
    var JSONCanvas = canvasElement.getAttribute("canvas");
    const initialCanvas = new fabric.Canvas("canvas");
    //retrieve serialized fabric canvas
    initialCanvas.loadFromJSON(
      JSONCanvas,
      initialCanvas.renderAll.bind(initialCanvas),
    );

    //when
    fireEvent.click(button);

    //then
    JSONCanvas = canvasElement.getAttribute("canvas");
    const updatedCanvas = new fabric.Canvas("canvas");
    //retrieve serialized fabric canvas
    updatedCanvas.loadFromJSON(
      JSONCanvas,
      updatedCanvas.renderAll.bind(updatedCanvas),
    );
    expect(initialCanvas.getObjects().length).toEqual(0);
    expect(updatedCanvas.getObjects().length).toEqual(1);
  });

  it("adds a new row in the player sidebar", () => {
    //given
    const { container } = render(<NewTrackingEditor />);
    const button = screen.getByTestId("add-player-button");
    const playerList = container.querySelector(".TrackListList").children[0];
    const initialRowNumber = playerList.childElementCount;

    //when
    fireEvent.click(button);

    //then
    //as the sidebar contains 3 lists(player, team, ball), the playerList is chosen.
    const updatedRowNumber = playerList.childElementCount;
    expect(initialRowNumber).toEqual(0);
    expect(updatedRowNumber).toEqual(1);
  });
});

describe("player sidebar", () => {
  it("displays all players in current frame", async () => {
    //given
    useLocation.mockReturnValue({
      state: {
        //up to now only necessary to mock processedPlayers
        //should render player 1, 2 in frame0, discard player2 in frame1
        processedPlayers: mockCSV,
        video: undefined,
        ballTracks: undefined,
        homographies: mockHomographies,
        log: mockLog,
        fieldSize: mockFieldSize,
      },
    });
    const { container } = render(<NewTrackingEditor />);
    const button = screen.getByTestId("from-annotation");

    //when
    fireEvent.click(button);

    //then
    //as the sidebar contains 3 lists(player, team, ball), the playerList is chosen.
    const playerList = container.querySelector(".TrackListList").children[0];
    expect(playerList.childElementCount).toEqual(2);
    expect(
      getNodeText(playerList.children[0].querySelector(".TrackListItemName")),
    ).toEqual("player1");
    expect(
      getNodeText(playerList.children[1].querySelector(".TrackListItemName")),
    ).toEqual("player2");
  });
});

describe("data fetching ball", () => {
  it("receives correct ballTracks annotation", async () => {
    //given
    useLocation.mockReturnValue({
      state: {
        //up to now only necessary to mock processedPlayers
        //should render player 1, 2 in frame0, discard player2 in frame1
        processedPlayers: mockCSV,
        video: undefined,
        processedBallTracks: mockCSVBall,
        homographies: mockHomographies,
        log: mockLog,
        fieldSize: mockFieldSize,
      },
    });
    const logSpy = jest.spyOn(global.console, "log");
    const mockAnnotationBall = parseProcessedBallTracks(mockCSVBall);
    //when
    render(<NewTrackingEditor />);

    //then
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        "retrieved ball tracks:",
        mockAnnotationBall,
      );
    });
  });
});
