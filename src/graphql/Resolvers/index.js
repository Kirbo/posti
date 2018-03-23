import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const resolverMap = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date either in ISO-8601 format or in epoch.',

    /**
     * Parse value.
     *
     * @param {String} value - Value.
     *
     * @returns {Date} New date.
     */
    parseValue: value => (
      new Date(value)
    ),

    /**
     * serialize.
     *
     * @param {String} value - Value.
     *
     * @returns {Date} Timestamp in milliseconds.
     */
    serialize: value => (
      value.getTime()
    ),

    /**
     * Parse literal.
     *
     * @param {String} ast - Value.
     *
     * @returns {Date} New date.
     */
    parseLiteral: (ast) => {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      }
      return null;
    },
  }),
};

export default resolverMap;
