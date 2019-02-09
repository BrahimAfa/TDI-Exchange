import React from "react";
import styled from "styled-components";
import ReactTags from "react-tag-autocomplete";
import { Query } from "react-apollo";

import { TAGS, CREATE_TAG } from "../../queries";
import "./style.css";
import Loader from "../loader";
import Icon from "../icons";

class TagPicker extends React.Component {
  state = {
    searchValue: ""
  };

  handleInputChange = async searchValue => {
    const currentSearchValue = searchValue.trim().toLowerCase();
    this.setState({
      searchValue: currentSearchValue
    });
  };

  // passing the index of the tag to delete it
  // and update the state
  handleDeleteTag = i => {
    const { tags } = this.props;
    tags.splice(i, 1);
    this.props.onChange("tags", tags);
  };
  //passing the new tag to add it to the state
  handleAddTag = newTag => {
    const { tags } = this.props;
    let exists = false;
    // check if the tag is not exists to avoids duplication
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].name === newTag.name) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      const newTags = [...tags, newTag];
      this.props.onChange("tags", newTags);
    }
  };

  handleClickToAddTag = async client => {
    const name = this.state.searchValue;
    this.setState({ searchValue: "" });
    await client.mutate({
      mutation: CREATE_TAG,
      variables: { name },
      optimisticResponse: {
        __typename: "Mutation",
        createTag: {
          __typename: "Tag",
          id: `${Date.now()}-${name}`,
          name
        }
      },
      update: (cache, { data: { createTag } }) => {
        this.handleAddTag(createTag);
        const { tags } = cache.readQuery({
          query: TAGS,
          variables: {
            first: 6,
            where: { name_starts_with: name }
          }
        });
        cache.writeQuery({
          query: TAGS,
          data: {
            tags: [...tags, createTag]
          }
        });
      }
    });
  };

  render() {
    const { searchValue } = this.state;
    const { tags, hasError } = this.props;
    return (
      <Query
        query={TAGS}
        variables={{
          first: 6,
          where: { name_starts_with: searchValue }
        }}
        skip={!searchValue || searchValue.length < 1}
        errorPolicy="ignore"
        fetchPolicy="cache-and-network"
      >
        {({ data, loading, client }) => {
          let suggestions = [];
          if (data && data.tags) {
            suggestions = data.tags;
          }
          return (
            <>
              <ReactTags
                tags={tags}
                suggestions={suggestions}
                handleDelete={this.handleDeleteTag}
                handleAddition={this.handleAddTag}
                handleInputChange={value => this.handleInputChange(value)}
                placeholder="Add tags"
                minQueryLength={1}
                delimiters={[]}
                autofocus={false}
                classNames={{
                  root: hasError ? "react-tags-error" : "react-tags"
                }}
              />
              {loading && (
                <ReactTagsStyle>
                  <div className="react-tags">
                    <span className="loader">
                      <Loader inline color="#1d49e3" />
                    </span>
                  </div>
                </ReactTagsStyle>
              )}
              {!loading && !suggestions.length && searchValue.length > 2 && (
                <ReactTagsStyle>
                  <div className="react-tags">
                    <div className="react-tags__suggestions">
                      <ul>
                        <li onClick={() => this.handleClickToAddTag(client)}>
                          <Icon
                            style={{
                              color: "#1d49e3",
                              display: "inline",
                              padding: "0px 10px",
                              marginRight: "10px"
                            }}
                            iconName="add"
                          />
                          <span>{searchValue}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </ReactTagsStyle>
              )}
            </>
          );
        }}
      </Query>
    );
  }
}

export default TagPicker;

const ReactTagsStyle = styled.div`
  > .react-tags {
    background-color: transparent;
    padding: 0;
    margin: 0;
    border: none;
  }
`;
