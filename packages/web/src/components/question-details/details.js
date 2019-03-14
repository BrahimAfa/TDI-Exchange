import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Mutation } from "react-apollo";
import { navigate } from "@reach/router";

import { QuestionBody } from "../question/style";
import Answer from "../answer";
import CreateAnswer from "../create-answer";
import { AuthConsumer } from "../../context/AuthContext";
import RichRender from "../rich-texte-rendrer";
import LogInModal from "../login-as-modal";
import Pagination from "../pagination";
import {
  DetailsContainerStyle,
  QuestionDetails,
  AnswersSection,
  ActionBarStyle,
  OutLinedBtn
} from "./style";
import { ITEMS_ON_PAGE } from "../../constants";
import QuestionHeader from "./questionHeader";
import { AnswerContentLoader } from "../loader";
import Icon from "../icons";
import EditQuestion from "./edit-answer";
import { DELETE_QUESTION } from "../../queries";
import Modal from "../modal";
import Button, { TextButton } from "../button";
import { formatError } from "../../utils";

const createdAtDESC = "createdAt_DESC";
const createdAtASC = "createdAt_ASC";

const Details = ({
  question,
  currentPage,
  handlePaginationChange,
  handleOrderBy,
  activeDesc,
  activeAsc,
  loading,
  isEditing,
  setIsEditing
}) => {
  const { isOwner } = question;
  const [dropdownBtnHover, setDropdownBtnHover] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  const toggleDropdown = () => {
    setDropdownBtnHover(!dropdownBtnHover);
  };

  const deleteQuestionAndRedirect = async deleteQuestion => {
    try {
      await deleteQuestion();
      await navigate("/");
    } catch (err) {
      if (err.graphQLErrors) {
        // const error = formatError(err);
        // TODO display an alert to user about this error
      }
    }
  };

  return (
    <AuthConsumer>
      {({ currentUser }) => (
        <Mutation
          mutation={DELETE_QUESTION}
          variables={{ questionId: question.id }}
        >
          {(deleteQuestion, mutationResult) => {
            const deleting = mutationResult.loading;
            return isEditing ? (
              <EditQuestion
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                header={question.header}
                body={question.body}
                questionId={question.id}
              />
            ) : (
              <DetailsContainerStyle>
                {/* question header style */}
                <QuestionHeader
                  user={question.askedBy}
                  createdAt={question.createdAt}
                />
                {/* question header */}
                <QuestionBody>
                  <h1>{question.header}</h1>
                </QuestionBody>
                {/* question body if it is exists */}
                {question.body && (
                  <QuestionDetails>
                    <RichRender body={question.body} />
                  </QuestionDetails>
                )}
                {/* total answer a question have */}
                <ActionBarStyle>
                  <h3>{`${question.totalAnswers} Answers`}</h3>
                  <div>
                    <OutLinedBtn
                      onClick={() => handleOrderBy(createdAtDESC)}
                      activeDesc={activeDesc}
                    >
                      <Icon iconName="arrowUp" />
                    </OutLinedBtn>
                    <OutLinedBtn
                      onClick={() => handleOrderBy(createdAtASC)}
                      activeAsc={activeAsc}
                    >
                      <Icon iconName="arrowDown" />
                    </OutLinedBtn>
                    {currentUser && isOwner && (
                      <div
                        onMouseEnter={toggleDropdown}
                        onMouseLeave={toggleDropdown}
                        style={{ position: "relative" }}
                      >
                        <OutLinedBtn>
                          <Icon iconName="gear" />
                        </OutLinedBtn>
                        {dropdownBtnHover && (
                          <DropDownContent>
                            <ul>
                              <DropDownItem onClick={() => setIsEditing(true)}>
                                <Icon iconName="edit" />
                                <Text>Edit</Text>
                              </DropDownItem>
                              <DropDownItem
                                className="danger"
                                onClick={() => setModalOpen(true)}
                              >
                                <Icon iconName="delete" />
                                <Text>Delete</Text>
                              </DropDownItem>
                            </ul>
                          </DropDownContent>
                        )}
                        <Modal
                          title="Are you sure you want to delete this question?"
                          isOpen={modalOpen}
                          closeModal={() => !deleting && setModalOpen(false)}
                        >
                          <ModalBtns>
                            <Button
                              onClick={() =>
                                deleteQuestionAndRedirect(deleteQuestion)
                              }
                              loading={deleting}
                            >
                              Delete
                            </Button>
                            {!deleting && (
                              <TextButton onClick={() => setModalOpen(false)}>
                                Cancel
                              </TextButton>
                            )}
                          </ModalBtns>
                        </Modal>
                      </div>
                    )}
                  </div>
                </ActionBarStyle>
                {/* answer section */}
                {loading ? (
                  <AnswerContentLoader />
                ) : (
                  <AnswersSection>
                    {question.answers.map(answer => (
                      <Answer key={answer.id} answer={answer} />
                    ))}
                  </AnswersSection>
                )}
                {/* pagination */}
                {question.totalAnswers > ITEMS_ON_PAGE && !loading && (
                  <Pagination
                    defaultCurrent={1}
                    total={question.totalAnswers}
                    current={currentPage}
                    pageSize={ITEMS_ON_PAGE}
                    onChange={handlePaginationChange}
                    style={{ alignSelf: "center", margin: "2rem 0 0.5rem 0" }}
                  />
                )}
                {currentUser && (
                  <ActionBarStyle>
                    <span>Contribute to this question</span>
                  </ActionBarStyle>
                )}
                {/* create answer input */}
                {currentUser && <CreateAnswer questionId={question.id} />}
                {!currentUser && (
                  <ActionBarStyle>
                    <LogInModal />
                  </ActionBarStyle>
                )}
              </DetailsContainerStyle>
            );
          }}
        </Mutation>
      )}
    </AuthConsumer>
  );
};

export default Details;
Details.propTypes = {
  question: PropTypes.shape({
    totalAnswers: PropTypes.number,
    body: PropTypes.string,
    header: PropTypes.string,
    createdAt: PropTypes.string,
    answers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        answer: PropTypes.string
      })
    )
  }).isRequired,
  currentPage: PropTypes.number.isRequired,
  handlePaginationChange: PropTypes.func.isRequired,
  handleOrderBy: PropTypes.func.isRequired,
  activeDesc: PropTypes.bool.isRequired,
  activeAsc: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  setIsEditing: PropTypes.func.isRequired
};

const DropDownContent = styled.div`
  position: absolute;
  right: 0;
  border: 1px solid #f8f8f8;
  padding: 8px 0px;
  background-color: white;
  box-shadow: 0px 0px 18px 0px #d7d4d4;
  border-radius: 4.71px;
  width: 170px;
  z-index: 100;
  > ul {
    list-style: none;
  }
  .danger {
    color: ${props => props.theme.error.primary};
  }
`;
const DropDownItem = styled.li`
  padding: 8px 16px;
  margin: 0.1rem 0rem;
  border-bottom: 1px solid #e6e4e4;
  transition: all 0.2s ease-in;
  cursor: pointer;
  display: flex;
  &:last-of-type {
    border-bottom: none;
  }
  &:hover {
    background-color: rgb(247, 249, 250);
  }
  > div {
    width: 21px;
    margin-right: 0.6rem;
  }
`;
const Text = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
`;
const ModalBtns = styled.div`
  display: flex;
  > button {
    margin-right: 1rem;
  }
`;
